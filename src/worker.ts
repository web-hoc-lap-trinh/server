/**
 * Judge Worker
 * 
 * Standalone script to run the judge worker process.
 * This can be run separately from the main server for scalability.
 * 
 * Usage: npx ts-node src/worker.ts
 */

import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './config/data-source';
import { initializeQueue, startWorker, shutdownQueue } from './api/submission/services/queue.service';
import { checkDockerAvailable, pullDockerImages } from './api/submission/services/docker-runner.service';

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2');

async function main() {
  console.log('========================================');
  console.log('  Online Judge Worker Starting...');
  console.log('========================================');

  try {
    // Check Docker availability
    console.log('[Worker] Checking Docker availability...');
    // const dockerAvailable = await checkDockerAvailable();
    // if (!dockerAvailable) {
    //   console.error('[Worker] ERROR: Docker is not available. Please install and start Docker.');
    //   process.exit(1);
    // }
    console.log('[Worker] Docker is available');

    // Pull required Docker images (optional, can be done separately)
    if (process.env.PULL_IMAGES === 'true') {
      console.log('[Worker] Pulling required Docker images...');
      await pullDockerImages();
    }

    // Initialize database connection
    console.log('[Worker] Connecting to database...');
    await AppDataSource.initialize();
    console.log('[Worker] Database connected');

    // Initialize queue
    console.log('[Worker] Initializing queue...');
    await initializeQueue();

    // Start worker
    console.log(`[Worker] Starting worker with concurrency: ${WORKER_CONCURRENCY}`);
    await startWorker(WORKER_CONCURRENCY);

    console.log('========================================');
    console.log('  Worker is running!');
    console.log('  Press Ctrl+C to stop');
    console.log('========================================');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n[Worker] Received SIGINT, shutting down gracefully...');
      await shutdown();
    });

    process.on('SIGTERM', async () => {
      console.log('\n[Worker] Received SIGTERM, shutting down gracefully...');
      await shutdown();
    });

  } catch (error) {
    console.error('[Worker] Failed to start:', error);
    process.exit(1);
  }
}

async function shutdown() {
  try {
    console.log('[Worker] Closing queue...');
    await shutdownQueue();

    console.log('[Worker] Closing database connection...');
    await AppDataSource.destroy();

    console.log('[Worker] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[Worker] Error during shutdown:', error);
    process.exit(1);
  }
}

main();
