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

  const { answer } = req.body;
  if (!answer) {
    throw new BadRequestError('Vui lòng cung cấp câu trả lời');
  }

  const result = await exerciseService.submitAnswer(exerciseId, answer);
  
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
