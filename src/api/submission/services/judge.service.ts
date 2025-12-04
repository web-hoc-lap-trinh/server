/**
 * Judge Service
 * 
 * This module handles the evaluation of code submissions.
 * It orchestrates:
 * - Fetching problem and test cases
 * - Running code in Docker sandbox
 * - Comparing outputs
 * - Computing scores
 * - Updating submission results
 * - Updating user progress
 */

import { AppDataSource } from '../../../config/data-source';
import { Submission, SubmissionStatus, ExecutionLogs, TestCaseResult } from '../submission.entity';
import { Problem } from '../../problem/problem.entity';
import { TestCase } from '../../problem/testcase.entity';
import { Language } from '../../problem/language.entity';
import { User } from '../../auth/user.entity';
import * as dockerRunner from './docker-runner.service';
import * as submissionService from '../submission.service';
import { emitSubmissionStatusUpdate } from '../../../realtime/events';

const submissionRepository = AppDataSource.getRepository(Submission);
const problemRepository = AppDataSource.getRepository(Problem);
const testCaseRepository = AppDataSource.getRepository(TestCase);
const languageRepository = AppDataSource.getRepository(Language);
const userRepository = AppDataSource.getRepository(User);

// ==========================================
// INTERFACES
// ==========================================

export interface JudgeJobData {
  submissionId: number;
  problemId: number;
  userId: number;
}

export interface JudgeResult {
  submissionId: number;
  status: SubmissionStatus;
  executionTime: number;
  memoryUsed: number;
  pointsEarned: number;
  testCasesPassed: number;
  totalTestCases: number;
  stdout: string;
  stderr: string;
  errorMessage?: string;
  executionLogs: ExecutionLogs;
}

// ==========================================
// MAIN JUDGE FUNCTION
// ==========================================

/**
 * Judge a submission
 * This is the main entry point for evaluating a code submission
 */
export async function judgeSubmission(jobData: JudgeJobData): Promise<JudgeResult> {
  const { submissionId, problemId, userId } = jobData;
  const startTime = Date.now();

  // Starting evaluation for submission

  try {
    // Update status to running
    await submissionService.updateSubmissionStatus(submissionId, SubmissionStatus.RUNNING);
    emitSubmissionStatusUpdate({
        submission_id: submissionId,
        status: SubmissionStatus.RUNNING,
    });

    // Fetch submission details
    const submission = await submissionRepository.findOne({
      where: { submission_id: submissionId },
    });

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    // Fetch problem details
    const problem = await problemRepository.findOne({
      where: { problem_id: problemId },
    });

    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    // Fetch language details
    const language = await languageRepository.findOne({
      where: { language_id: submission.language_id },
    });

    if (!language) {
      throw new Error(`Language ${submission.language_id} not found`);
    }

    // Fetch all test cases for the problem
    const testCases = await testCaseRepository.find({
      where: { problem_id: problemId },
      order: { test_case_id: 'ASC' },
    });

    if (testCases.length === 0) {
      throw new Error(`No test cases found for problem ${problemId}`);
    }

    // Prepare test cases for execution
    const testCaseInputs = testCases.map(tc => ({
      input: tc.input_data,
      expectedOutput: tc.expected_output,
      score: tc.score,
      testCaseId: tc.test_case_id,
      isSample: tc.is_sample,
    }));

    // Execute code against all test cases
    const executionResult = await dockerRunner.executeWithTestCases(
      language.code,
      submission.source_code,
      testCaseInputs,
      problem.time_limit,
      problem.memory_limit
    );

    // Determine final status
    let finalStatus = SubmissionStatus.ACCEPTED;
    let errorMessage: string | undefined;

    // Check for compile error
    if (executionResult.results.some(r => r.status === 'compile_error')) {
      finalStatus = SubmissionStatus.COMPILE_ERROR;
      errorMessage = executionResult.results.find(r => r.status === 'compile_error')?.stderr;
    }
    // Check for runtime error
    else if (executionResult.results.some(r => r.status === 'runtime_error')) {
      finalStatus = SubmissionStatus.RUNTIME_ERROR;
      const failedTest = executionResult.results.find(r => r.status === 'runtime_error');
      errorMessage = failedTest?.stderr;
    }
    // Check for time limit exceeded
    else if (executionResult.results.some(r => r.status === 'timeout')) {
      finalStatus = SubmissionStatus.TIME_LIMIT;
    }
    // Check for memory limit exceeded
    else if (executionResult.results.some(r => r.status === 'memory_limit')) {
      finalStatus = SubmissionStatus.MEMORY_LIMIT;
    }
    // Check for wrong answer
    else if (executionResult.totalPassed < testCases.length) {
      finalStatus = SubmissionStatus.WRONG_ANSWER;
    }

    // Calculate points based on scoring method
    const totalPossibleScore = testCases.reduce((sum, tc) => sum + tc.score, 0);
    const pointsEarned = Math.round((executionResult.totalScore / totalPossibleScore) * problem.points);

    // Build execution logs
    const executionLogs: ExecutionLogs = {
      test_case_results: executionResult.results.map(r => ({
        test_case_id: r.testCaseId,
        status: mapStatusToSubmissionStatus(r.status, r.passed),
        execution_time: r.executionTime,
        memory_used: r.memoryUsed,
        stdout: r.isSample ? r.stdout : '', // Only show output for sample test cases
        stderr: r.stderr,
        expected_output: r.isSample ? testCases.find(tc => tc.test_case_id === r.testCaseId)?.expected_output : undefined,
        actual_output: r.isSample ? r.stdout : undefined,
        score: r.score,
        is_sample: r.isSample,
      })),
      total_execution_time: executionResult.maxExecutionTime,
      max_memory_used: executionResult.maxMemoryUsed,
      judged_at: new Date().toISOString(),
    };

    // Prepare result
    const result: JudgeResult = {
      submissionId,
      status: finalStatus,
      executionTime: executionResult.maxExecutionTime,
      memoryUsed: executionResult.maxMemoryUsed,
      pointsEarned,
      testCasesPassed: executionResult.totalPassed,
      totalTestCases: testCases.length,
      stdout: executionResult.results.find(r => r.isSample)?.stdout || '',
      stderr: executionResult.results.find(r => r.stderr)?.stderr || '',
      errorMessage,
      executionLogs,
    };

    // Update submission with result
    await updateSubmissionResult(submissionId, result);

    // Update user progress and problem statistics
    await updateProgressAndStats(userId, problemId, finalStatus === SubmissionStatus.ACCEPTED, pointsEarned);

    emitSubmissionStatusUpdate({
        submission_id: submissionId,
        status: finalStatus,
        execution_time: result.executionTime,
        memory_used: result.memoryUsed,
        test_cases_passed: result.testCasesPassed,
        total_test_cases: result.totalTestCases,
        error_message: result.errorMessage,
    }); 

    const totalTime = Date.now() - startTime;
    // Evaluation completed

    return result;
  } catch (error: any) {
    console.error(`[Judge] Error evaluating submission ${submissionId}:`, error);

    // Update submission with error
    const errorResult: JudgeResult = {
      submissionId,
      status: SubmissionStatus.INTERNAL_ERROR,
      executionTime: 0,
      memoryUsed: 0,
      pointsEarned: 0,
      testCasesPassed: 0,
      totalTestCases: 0,
      stdout: '',
      stderr: error.message || 'Internal judge error',
      errorMessage: error.message || 'Internal judge error',
      executionLogs: {
        test_case_results: [],
        total_execution_time: 0,
        max_memory_used: 0,
        judged_at: new Date().toISOString(),
      },
    };

    await updateSubmissionResult(submissionId, errorResult);
    emitSubmissionStatusUpdate({
        submission_id: submissionId,
        status: SubmissionStatus.INTERNAL_ERROR,
        error_message: errorResult.errorMessage,
    });
    return errorResult;
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Map Docker runner status to submission status
 */
function mapStatusToSubmissionStatus(
  status: dockerRunner.ExecutionResult['status'],
  passed: boolean
): SubmissionStatus {
  switch (status) {
    case 'success':
      return passed ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER;
    case 'timeout':
      return SubmissionStatus.TIME_LIMIT;
    case 'memory_limit':
      return SubmissionStatus.MEMORY_LIMIT;
    case 'runtime_error':
      return SubmissionStatus.RUNTIME_ERROR;
    case 'compile_error':
      return SubmissionStatus.COMPILE_ERROR;
    default:
      return SubmissionStatus.RUNTIME_ERROR;
  }
}

/**
 * Update submission with judge result
 */
async function updateSubmissionResult(submissionId: number, result: JudgeResult): Promise<void> {
  await submissionRepository.update(submissionId, {
    status: result.status,
    execution_time: result.executionTime,
    memory_used: result.memoryUsed,
    points_earned: result.pointsEarned,
    test_cases_passed: result.testCasesPassed,
    stdout: result.stdout,
    stderr: result.stderr,
    error_message: result.errorMessage || null,
    execution_logs: result.executionLogs,
  });
}

/**
 * Update user progress and problem statistics
 */
async function updateProgressAndStats(
  userId: number,
  problemId: number,
  isAccepted: boolean,
  pointsEarned: number
): Promise<void> {
  try {
    // Check if this is the first accepted submission for this user-problem pair
    const existingAccepted = await submissionRepository.count({
      where: {
        user_id: userId,
        problem_id: problemId,
        status: SubmissionStatus.ACCEPTED,
      },
    });

    // Update problem statistics
    await problemRepository
      .createQueryBuilder()
      .update(Problem)
      .set({
        total_submissions: () => 'total_submissions + 1',
        accepted_submissions: isAccepted ? () => 'accepted_submissions + 1' : undefined,
      })
      .where('problem_id = :problemId', { problemId })
      .execute();

    // Update acceptance rate
    await problemRepository
      .createQueryBuilder()
      .update(Problem)
      .set({
        acceptance_rate: () => 'ROUND((accepted_submissions / total_submissions) * 100, 2)',
      })
      .where('problem_id = :problemId', { problemId })
      .execute();

    // Update user stats only if this is the first accepted submission
    if (isAccepted && existingAccepted === 1) {
      await userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          solved_problems: () => 'solved_problems + 1',
          total_score: () => `total_score + ${pointsEarned}`,
          last_active: new Date(),
        })
        .where('user_id = :userId', { userId })
        .execute();
    } else {
      // Just update last_active
      await userRepository.update(userId, { last_active: new Date() });
    }

    // Update daily activity (if table exists)
    await updateDailyActivity(userId, isAccepted, pointsEarned);

    // Update user_progress table
    await updateUserProgress(userId, problemId, isAccepted, pointsEarned);
  } catch (error) {
    console.error('[Judge] Error updating progress and stats:', error);
    // Don't throw - submission result is already saved
  }
}

/**
 * Update daily activity tracking
 */
async function updateDailyActivity(
  userId: number,
  problemSolved: boolean,
  pointsEarned: number
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Try to update existing record
    const result = await AppDataSource.query(
      `UPDATE daily_activities 
       SET problems_solved = problems_solved + ?,
           points_earned = points_earned + ?
       WHERE user_id = ? AND activity_date = ?`,
      [problemSolved ? 1 : 0, pointsEarned, userId, today]
    );

    // If no record exists, create one
    if (result.affectedRows === 0) {
      await AppDataSource.query(
        `INSERT INTO daily_activities (user_id, activity_date, problems_solved, points_earned)
         VALUES (?, ?, ?, ?)`,
        [userId, today, problemSolved ? 1 : 0, pointsEarned]
      );
    }
  } catch (error) {
    console.error('[Judge] Error updating daily activity:', error);
  }
}

/**
 * Update user_progress table
 */
async function updateUserProgress(
  userId: number,
  problemId: number,
  isAccepted: boolean,
  score: number
): Promise<void> {
  try {
    const status = isAccepted ? 'completed' : 'in_progress';
    
    // Try to update existing record
    const result = await AppDataSource.query(
      `UPDATE user_progress 
       SET status = ?,
           attempts_count = attempts_count + 1,
           best_score = GREATEST(best_score, ?),
           completed_at = IF(? = 'completed' AND completed_at IS NULL, NOW(), completed_at),
           last_accessed = NOW()
       WHERE user_id = ? AND problem_id = ?`,
      [status, score, status, userId, problemId]
    );

    // If no record exists, create one
    if (result.affectedRows === 0) {
      await AppDataSource.query(
        `INSERT INTO user_progress 
         (user_id, problem_id, status, attempts_count, best_score, first_attempt_at, completed_at, last_accessed)
         VALUES (?, ?, ?, 1, ?, NOW(), IF(? = 'completed', NOW(), NULL), NOW())`,
        [userId, problemId, status, score, status]
      );
    }
  } catch (error) {
    console.error('[Judge] Error updating user progress:', error);
  }
}

/**
 * Update system statistics
 */
async function updateSystemStats(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await AppDataSource.query(
      `INSERT INTO system_stats (stat_date, total_submissions)
       VALUES (?, 1)
       ON DUPLICATE KEY UPDATE total_submissions = total_submissions + 1`,
      [today]
    );
  } catch (error) {
    console.error('[Judge] Error updating system stats:', error);
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Re-judge a submission
 */
export async function rejudgeSubmission(submissionId: number): Promise<JudgeResult> {
  const submission = await submissionRepository.findOne({
    where: { submission_id: submissionId },
  });

  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  return judgeSubmission({
    submissionId,
    problemId: submission.problem_id,
    userId: submission.user_id,
  });
}

/**
 * Re-judge all submissions for a problem
 */
export async function rejudgeProblem(problemId: number): Promise<void> {
  const submissions = await submissionRepository.find({
    where: { problem_id: problemId },
    select: ['submission_id', 'user_id'],
  });

  // Re-judging submissions for problem

  for (const submission of submissions) {
    try {
      await judgeSubmission({
        submissionId: submission.submission_id,
        problemId,
        userId: submission.user_id,
      });
    } catch (error) {
      console.error(`[Judge] Error re-judging submission ${submission.submission_id}:`, error);
    }
  }
}
