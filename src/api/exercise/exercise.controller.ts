import { Request, Response } from 'express';
import * as exerciseService from './exercise.service';
import { successResponse, createdResponse, BadRequestError } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get all exercises for a lesson (summary - no answers)
 */
export const getExercisesByLesson = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const result = await exerciseService.getExercisesByLessonId(lessonId);
  successResponse(res, 'Lấy danh sách bài tập thành công', result);
});

/**
 * Get first exercise of a lesson (start exercise session)
 */
export const getFirstExerciseByLesson = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const result = await exerciseService.getFirstExercise(lessonId);
  if (!result) {
    successResponse(res, 'Bài học này chưa có bài tập', { has_exercises: false });
    return;
  }

  successResponse(res, 'Lấy bài tập đầu tiên thành công', {
    has_exercises: true,
    ...result,
  });
});

/**
 * Get single exercise by ID (with navigation)
 */
export const getExercise = asyncHandler(async (req: Request, res: Response) => {
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) {
    throw new BadRequestError('Invalid Exercise ID');
  }

  const result = await exerciseService.getExerciseById(exerciseId);
  successResponse(res, 'Lấy bài tập thành công', result);
});

/**
 * Submit answer for an exercise
 */
export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) {
    throw new BadRequestError('Invalid Exercise ID');
  }

  const { answer, time_spent_seconds } = req.body;
  if (!answer) {
    throw new BadRequestError('Vui lòng cung cấp câu trả lời');
  }

  const userId = (req as any).user?.user_id;
  if (!userId) {
    throw new BadRequestError('Không tìm thấy thông tin người dùng');
  }

  const result = await exerciseService.submitAnswer(exerciseId, answer, userId, time_spent_seconds);
  
  const message = result.is_correct 
    ? 'Chính xác!' 
    : 'Sai rồi. Hãy thử lại!';

  successResponse(res, message, result);
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * [ADMIN] Get all exercises for a lesson (with answers)
 */
export const getExercisesByLessonAdmin = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const exercises = await exerciseService.getExercisesByLessonIdAdmin(lessonId);
  successResponse(res, 'Lấy danh sách bài tập thành công', exercises);
});

/**
 * [ADMIN] Get single exercise with all details
 */
export const getExerciseAdmin = asyncHandler(async (req: Request, res: Response) => {
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) {
    throw new BadRequestError('Invalid Exercise ID');
  }

  const exercise = await exerciseService.getExerciseByIdAdmin(exerciseId);
  successResponse(res, 'Lấy chi tiết bài tập thành công', exercise);
});

/**
 * [ADMIN] Create new exercise
 */
export const createExercise = asyncHandler(async (req: Request, res: Response) => {
  const { lesson_id, question, exercise_type, options, correct_answer, explanation, order_index } = req.body;

  if (!lesson_id || !question || !exercise_type || !options || !correct_answer) {
    throw new BadRequestError('Thiếu thông tin bắt buộc: lesson_id, question, exercise_type, options, correct_answer');
  }

  const exercise = await exerciseService.createExercise({
    lesson_id,
    question,
    exercise_type,
    options,
    correct_answer,
    explanation,
    order_index,
  });

  createdResponse(res, 'Tạo bài tập thành công', exercise);
});

/**
 * [ADMIN] Update exercise
 */
export const updateExercise = asyncHandler(async (req: Request, res: Response) => {
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) {
    throw new BadRequestError('Invalid Exercise ID');
  }

  const updateData = req.body;
  const exercise = await exerciseService.updateExercise(exerciseId, updateData);
  successResponse(res, 'Cập nhật bài tập thành công', exercise);
});

/**
 * [ADMIN] Delete exercise
 */
export const deleteExercise = asyncHandler(async (req: Request, res: Response) => {
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) {
    throw new BadRequestError('Invalid Exercise ID');
  }

  const result = await exerciseService.deleteExercise(exerciseId);
  successResponse(res, result.message);
});

/**
 * [ADMIN] Reorder exercises in a lesson
 */
export const reorderExercises = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const { orders } = req.body;
  if (!orders || !Array.isArray(orders)) {
    throw new BadRequestError('Vui lòng cung cấp danh sách thứ tự bài tập');
  }

  const exercises = await exerciseService.reorderExercises(lessonId, orders);
  successResponse(res, 'Sắp xếp lại bài tập thành công', exercises);
});

// ==================== SUBMISSION HISTORY ENDPOINTS ====================

/**
 * Get submission history for a specific exercise
 */
export const getExerciseHistory = asyncHandler(async (req: Request, res: Response) => {
  const exerciseId = parseInt(req.params.exerciseId);
  if (isNaN(exerciseId)) {
    throw new BadRequestError('Invalid Exercise ID');
  }

  const userId = (req as any).user?.user_id;
  if (!userId) {
    throw new BadRequestError('Không tìm thấy thông tin người dùng');
  }

  const history = await exerciseService.getExerciseSubmissionHistory(userId, exerciseId);
  successResponse(res, 'Lấy lịch sử làm bài tập thành công', history);
});

/**
 * Get submission history for a lesson
 */
export const getLessonHistory = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const userId = (req as any).user?.user_id;
  if (!userId) {
    throw new BadRequestError('Không tìm thấy thông tin người dùng');
  }

  const history = await exerciseService.getLessonSubmissionHistory(userId, lessonId);
  successResponse(res, 'Lấy lịch sử làm bài của bài học thành công', history);
});

/**
 * Get all submission history for current user
 */
export const getUserHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.user_id;
  if (!userId) {
    throw new BadRequestError('Không tìm thấy thông tin người dùng');
  }

  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  const lessonId = req.query.lesson_id ? parseInt(req.query.lesson_id as string) : undefined;
  const onlyCorrect = req.query.only_correct === 'true';

  const history = await exerciseService.getUserSubmissionHistory(userId, {
    page,
    limit,
    lessonId,
    onlyCorrect: onlyCorrect || undefined,
  });

  successResponse(res, 'Lấy lịch sử làm bài thành công', history);
});

/**
 * Get user exercise statistics
 */
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.user_id;
  if (!userId) {
    throw new BadRequestError('Không tìm thấy thông tin người dùng');
  }

  const stats = await exerciseService.getUserExerciseStats(userId);
  successResponse(res, 'Lấy thống kê làm bài thành công', stats);
});
