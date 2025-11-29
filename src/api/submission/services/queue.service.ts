/**
 * Queue Service (BullMQ)
 * 
 * This module handles job queue management for asynchronous code judging.
 * Uses Redis as the backing store via BullMQ.
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { judgeSubmission, JudgeJobData, JudgeResult } from './judge.service';

// ==========================================
// QUEUE CONFIGURATION
// ==========================================

const QUEUE_NAME = 'judge-queue';

// Redis connection configuration
const getRedisConnection = () => {
  const config: any = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.warn('[Queue] Redis connection failed after 3 retries, giving up');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 1000);
    },
  };
  
  // Only add password if it's set and not empty
  if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
    config.password = process.env.REDIS_PASSWORD;
  }
  
  return config;
};

// Queue options
const getQueueOptions = () => ({
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential' as const,
      delay: 1000, // Start with 1 second delay
    },
  },
});

// ==========================================
// QUEUE INSTANCE
// ==========================================

let judgeQueue: Queue<JudgeJobData, JudgeResult> | null = null;
let judgeWorker: Worker<JudgeJobData, JudgeResult> | null = null;
let queueEvents: QueueEvents | null = null;
let queueAvailable = false;

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize the judge queue
 */
export async function initializeQueue(): Promise<void> {
  try {
    // Create queue
    judgeQueue = new Queue<JudgeJobData, JudgeResult>(QUEUE_NAME, getQueueOptions());

    // Test the connection by waiting for ready
    await judgeQueue.waitUntilReady();

    // Create queue events listener
    queueEvents = new QueueEvents(QUEUE_NAME, { connection: getRedisConnection() });

    queueAvailable = true;
    // Queue initialized successfully
  } catch (error: any) {
    console.error('[Queue] Failed to initialize queue:', error.message);
    queueAvailable = false;
    judgeQueue = null;
    throw error;
  }
}

/**
 * Start the judge worker
 */
export async function startWorker(concurrency: number = 2): Promise<void> {
  if (!judgeQueue || !queueAvailable) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }

  judgeWorker = new Worker<JudgeJobData, JudgeResult>(
    QUEUE_NAME,
    async (job: Job<JudgeJobData, JudgeResult>) => {
      console.log(`[Worker] Processing job ${job.id}, submission: ${job.data.submissionId}`);
      
      try {
        const result = await judgeSubmission(job.data);
        console.log(`[Worker] Job ${job.id} completed with status: ${result.status}`);
        return result;
      } catch (error: any) {
        console.error(`[Worker] Error processing job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency, // Number of jobs to process concurrently
      limiter: {
        max: 10, // Max 10 jobs per second
        duration: 1000,
      },
    }
  );

  // Wait for worker to be ready
  await judgeWorker.waitUntilReady();
  console.log('[Worker] Worker is ready and listening for jobs');

  // Worker event handlers
  judgeWorker.on('completed', (job: Job<JudgeJobData, JudgeResult>, result: JudgeResult) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  judgeWorker.on('failed', (job: Job<JudgeJobData, JudgeResult> | undefined, error: Error) => {
    console.error(`[Worker] Job ${job?.id} failed:`, error.message);
  });

  judgeWorker.on('error', (error: Error) => {
    console.error('[Worker] Worker error:', error.message);
  });

  judgeWorker.on('stalled', (jobId: string) => {
    console.warn(`[Worker] Job ${jobId} has stalled`);
  });

  judgeWorker.on('active', (job: Job<JudgeJobData, JudgeResult>) => {
    console.log(`[Worker] Job ${job.id} is now active`);
  });

  // Listen for queue events
  if (queueEvents) {
    queueEvents.on('waiting', ({ jobId }) => {
      console.log(`[Queue] Job ${jobId} is waiting`);
    });
    
    queueEvents.on('active', ({ jobId }) => {
      console.log(`[Queue] Job ${jobId} became active`);
    });
  }
}

// ==========================================
// QUEUE OPERATIONS
// ==========================================

/**
 * Add a job to the judge queue
 */
export async function addJudgeJob(data: JudgeJobData): Promise<Job<JudgeJobData, JudgeResult> | null> {
  if (!judgeQueue || !queueAvailable) {
    console.warn('[Queue] Queue not available, cannot add job');
    return null;
  }

  try {
    // Use timestamp to ensure unique jobId (prevents duplicates after restart)
    const jobId = `submission-${data.submissionId}-${Date.now()}`;
    const job = await judgeQueue.add('judge', data, {
      priority: 1, // Normal priority
      // Don't use jobId to avoid duplicates blocking new submissions
    });

    console.log(`[Queue] Job added for submission ${data.submissionId}, jobId: ${job.id}`);
    return job;
  } catch (error: any) {
    console.error(`[Queue] Failed to add job:`, error.message);
    return null;
  }
}

/**
 * Add a high-priority job (for re-judging)
 */
export async function addPriorityJudgeJob(data: JudgeJobData): Promise<Job<JudgeJobData, JudgeResult>> {
  if (!judgeQueue) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }

  const job = await judgeQueue.add('judge', data, {
    priority: 0, // High priority
    jobId: `rejudge-${data.submissionId}-${Date.now()}`,
  });

  // Priority job added successfully
  return job;
}

/**
 * Get job by submission ID
 */
export async function getJobBySubmissionId(submissionId: number): Promise<Job<JudgeJobData, JudgeResult> | null> {
  if (!judgeQueue) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }

  const jobId = `submission-${submissionId}`;
  const job = await judgeQueue.getJob(jobId);
  return job || null;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  if (!judgeQueue) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    judgeQueue.getWaitingCount(),
    judgeQueue.getActiveCount(),
    judgeQueue.getCompletedCount(),
    judgeQueue.getFailedCount(),
    judgeQueue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

/**
 * Pause the queue
 */
export async function pauseQueue(): Promise<void> {
  if (!judgeQueue) {
    throw new Error('Queue not initialized');
  }
  await judgeQueue.pause();
  console.log('[Queue] Queue paused');
}

/**
 * Resume the queue
 */
export async function resumeQueue(): Promise<void> {
  if (!judgeQueue) {
    throw new Error('Queue not initialized');
  }
  await judgeQueue.resume();
  console.log('[Queue] Queue resumed');
}

/**
 * Clean old jobs
 */
export async function cleanQueue(grace: number = 3600000): Promise<void> {
  if (!judgeQueue) {
    throw new Error('Queue not initialized');
  }

  await judgeQueue.clean(grace, 1000, 'completed');
  await judgeQueue.clean(grace * 24, 1000, 'failed');
  console.log('[Queue] Queue cleaned');
}

// ==========================================
// SHUTDOWN
// ==========================================

/**
 * Gracefully shutdown the queue and worker
 */
export async function shutdownQueue(): Promise<void> {
  console.log('[Queue] Shutting down...');

  if (judgeWorker) {
    await judgeWorker.close();
    judgeWorker = null;
  }

  if (queueEvents) {
    await queueEvents.close();
    queueEvents = null;
  }

  if (judgeQueue) {
    await judgeQueue.close();
    judgeQueue = null;
  }

  console.log('[Queue] Shutdown complete');
}

// ==========================================
// FALLBACK: SYNCHRONOUS EXECUTION
// ==========================================

/**
 * Fallback: Execute judging synchronously (when Redis is not available)
 * This is useful for development or when queue is not needed
 */
export async function executeSynchronously(data: JudgeJobData): Promise<JudgeResult> {
  // Executing synchronously
  return await judgeSubmission(data);
}

/**
 * Add judge job with fallback to synchronous execution
 */
export async function addJudgeJobWithFallback(data: JudgeJobData): Promise<void> {
  try {
    if (judgeQueue) {
      await addJudgeJob(data);
    } else {
      // Fallback to synchronous execution
      await executeSynchronously(data);
    }
  } catch (error: any) {
    // If queue fails, try synchronous execution
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Redis')) {
      await executeSynchronously(data);
    } else {
      throw error;
    }
  }
}
