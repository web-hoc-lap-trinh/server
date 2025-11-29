import { AppDataSource } from '../../config/data-source';
import { Submission, SubmissionStatus, ExecutionLogs, TestCaseResult } from './submission.entity';
import { Problem } from '../problem/problem.entity';
import { TestCase } from '../problem/testcase.entity';
import { Language } from '../problem/language.entity';
import { User } from '../auth/user.entity';
import { BadRequestError, NotFoundError } from '../../utils/apiResponse';
import * as problemService from '../problem/problem.service';

const submissionRepository = AppDataSource.getRepository(Submission);
const problemRepository = AppDataSource.getRepository(Problem);
const testCaseRepository = AppDataSource.getRepository(TestCase);
const languageRepository = AppDataSource.getRepository(Language);
const userRepository = AppDataSource.getRepository(User);

// ==========================================
// INTERFACES
// ==========================================

export interface CreateSubmissionDTO {
  user_id: number;
  problem_id: number;
  language: string; // Language code (e.g., 'cpp', 'python')
  source_code: string;
}

export interface SubmissionFilters {
  user_id?: number;
  problem_id?: number;
  status?: SubmissionStatus;
  language?: string;
  page?: number;
  limit?: number;
}

export interface JudgeResult {
  submission_id: number;
  status: SubmissionStatus;
  execution_time: number;
  memory_used: number;
  points_earned: number;
  test_cases_passed: number;
  total_test_cases: number;
  stdout: string;
  stderr: string;
  error_message?: string;
  execution_logs: ExecutionLogs;
}

// ==========================================
// SUBMISSION SERVICE FUNCTIONS
// ==========================================

/**
 * Create a new submission (pending status)
 */
export const createSubmission = async (data: CreateSubmissionDTO): Promise<Submission> => {
  // Validate problem exists
  const problem = await problemRepository.findOne({
    where: { problem_id: data.problem_id },
  });

  if (!problem) {
    throw new NotFoundError('Problem not found');
  }

  // Validate user exists
  const user = await userRepository.findOne({
    where: { user_id: data.user_id },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Validate language
  const language = await languageRepository.findOne({
    where: { code: data.language, is_active: true },
  });

  if (!language) {
    throw new BadRequestError(`Language '${data.language}' is not supported`);
  }

  // Validate source code
  if (!data.source_code || data.source_code.trim().length === 0) {
    throw new BadRequestError('Source code cannot be empty');
  }

  // Get total test cases count
  const totalTestCases = await testCaseRepository.count({
    where: { problem_id: data.problem_id },
  });

  // Create submission with pending status
  const submission = submissionRepository.create({
    user_id: data.user_id,
    problem_id: data.problem_id,
    language_id: language.language_id,
    language: language.name,
    language_version: language.version,
    source_code: data.source_code,
    status: SubmissionStatus.PENDING,
    total_test_cases: totalTestCases,
  });

  return await submissionRepository.save(submission);
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (
  submissionId: number,
  userId?: number
): Promise<Submission> => {
  const queryBuilder = submissionRepository
    .createQueryBuilder('submission')
    .leftJoinAndSelect('submission.user', 'user')
    .leftJoinAndSelect('submission.problem', 'problem')
    .where('submission.submission_id = :submissionId', { submissionId });

  // Non-admin users can only see their own submissions
  if (userId) {
    queryBuilder.andWhere('submission.user_id = :userId', { userId });
  }

  const submission = await queryBuilder.getOne();

  if (!submission) {
    throw new NotFoundError('Submission not found');
  }

  return submission;
};

/**
 * Get submissions with filters
 */
export const getSubmissions = async (
  filters: SubmissionFilters
): Promise<{ submissions: Submission[]; total: number }> => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const queryBuilder = submissionRepository
    .createQueryBuilder('submission')
    .leftJoinAndSelect('submission.user', 'user')
    .leftJoinAndSelect('submission.problem', 'problem')
    .select([
      'submission.submission_id',
      'submission.status',
      'submission.language',
      'submission.execution_time',
      'submission.memory_used',
      'submission.points_earned',
      'submission.test_cases_passed',
      'submission.total_test_cases',
      'submission.submitted_at',
      'user.user_id',
      'user.full_name',
      'user.avatar_url',
      'problem.problem_id',
      'problem.title',
      'problem.difficulty',
    ]);

  // Apply filters
  if (filters.user_id) {
    queryBuilder.andWhere('submission.user_id = :userId', { userId: filters.user_id });
  }

  if (filters.problem_id) {
    queryBuilder.andWhere('submission.problem_id = :problemId', { problemId: filters.problem_id });
  }

  if (filters.status) {
    queryBuilder.andWhere('submission.status = :status', { status: filters.status });
  }

  if (filters.language) {
    queryBuilder.andWhere('submission.language = :language', { language: filters.language });
  }

  // Get total count
  const total = await queryBuilder.getCount();

  // Apply pagination
  const submissions = await queryBuilder
    .orderBy('submission.submitted_at', 'DESC')
    .skip(skip)
    .take(limit)
    .getMany();

  return { submissions, total };
};

/**
 * Update submission status (used during judging)
 */
export const updateSubmissionStatus = async (
  submissionId: number,
  status: SubmissionStatus
): Promise<void> => {
  await submissionRepository.update(submissionId, { status });
};

/**
 * Update submission with judge result
 */
export const updateSubmissionResult = async (
  submissionId: number,
  result: Partial<JudgeResult>
): Promise<Submission> => {
  await submissionRepository.update(submissionId, {
    status: result.status,
    execution_time: result.execution_time,
    memory_used: result.memory_used,
    points_earned: result.points_earned,
    test_cases_passed: result.test_cases_passed,
    stdout: result.stdout,
    stderr: result.stderr,
    error_message: result.error_message,
    execution_logs: result.execution_logs,
  });

  return await getSubmissionById(submissionId);
};

/**
 * Get user's submissions for a problem
 */
export const getUserProblemSubmissions = async (
  userId: number,
  problemId: number
): Promise<Submission[]> => {
  return await submissionRepository.find({
    where: { user_id: userId, problem_id: problemId },
    order: { submitted_at: 'DESC' },
    take: 20,
  });
};

/**
 * Check if user has already solved a problem
 */
export const hasUserSolvedProblem = async (
  userId: number,
  problemId: number
): Promise<boolean> => {
  const acceptedSubmission = await submissionRepository.findOne({
    where: {
      user_id: userId,
      problem_id: problemId,
      status: SubmissionStatus.ACCEPTED,
    },
  });

  return !!acceptedSubmission;
};

/**
 * Update user progress after a submission
 */
export const updateUserProgress = async (
  userId: number,
  problemId: number,
  isAccepted: boolean,
  pointsEarned: number
): Promise<void> => {
  // Check if this is user's first accepted submission for this problem
  const previouslyAccepted = await submissionRepository.count({
    where: {
      user_id: userId,
      problem_id: problemId,
      status: SubmissionStatus.ACCEPTED,
    },
  });

  // Only update solved count if this is the first accepted submission
  if (isAccepted && previouslyAccepted === 1) {
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

  // Update problem statistics
  await problemService.updateProblemStats(problemId, isAccepted);
};

/**
 * Get submission statistics for a user
 */
export const getUserSubmissionStats = async (userId: number): Promise<{
  total_submissions: number;
  accepted: number;
  wrong_answer: number;
  time_limit: number;
  runtime_error: number;
  compile_error: number;
}> => {
  const stats = await submissionRepository
    .createQueryBuilder('submission')
    .select('submission.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .where('submission.user_id = :userId', { userId })
    .groupBy('submission.status')
    .getRawMany();

  const result = {
    total_submissions: 0,
    accepted: 0,
    wrong_answer: 0,
    time_limit: 0,
    runtime_error: 0,
    compile_error: 0,
  };

  stats.forEach((stat: { status: string; count: string }) => {
    const count = parseInt(stat.count);
    result.total_submissions += count;

    switch (stat.status) {
      case SubmissionStatus.ACCEPTED:
        result.accepted = count;
        break;
      case SubmissionStatus.WRONG_ANSWER:
        result.wrong_answer = count;
        break;
      case SubmissionStatus.TIME_LIMIT:
        result.time_limit = count;
        break;
      case SubmissionStatus.RUNTIME_ERROR:
        result.runtime_error = count;
        break;
      case SubmissionStatus.COMPILE_ERROR:
        result.compile_error = count;
        break;
    }
  });

  return result;
};

/**
 * Get leaderboard for a problem
 */
export const getProblemLeaderboard = async (
  problemId: number,
  limit: number = 50
): Promise<{
  user_id: number;
  full_name: string;
  avatar_url: string | null;
  execution_time: number;
  memory_used: number;
  language: string;
  submitted_at: Date;
}[]> => {
  const leaderboard = await submissionRepository
    .createQueryBuilder('submission')
    .leftJoin('submission.user', 'user')
    .select([
      'submission.user_id AS user_id',
      'user.full_name AS full_name',
      'user.avatar_url AS avatar_url',
      'MIN(submission.execution_time) AS execution_time',
      'MIN(submission.memory_used) AS memory_used',
      'submission.language AS language',
      'MIN(submission.submitted_at) AS submitted_at',
    ])
    .where('submission.problem_id = :problemId', { problemId })
    .andWhere('submission.status = :status', { status: SubmissionStatus.ACCEPTED })
    .groupBy('submission.user_id')
    .orderBy('execution_time', 'ASC')
    .addOrderBy('memory_used', 'ASC')
    .addOrderBy('submitted_at', 'ASC')
    .limit(limit)
    .getRawMany();

  return leaderboard;
};
