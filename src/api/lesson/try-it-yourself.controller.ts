import { Request, Response } from 'express';
import * as tryItYourselfService from './try-it-yourself.service';
import { successResponse, createdResponse, BadRequestError } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

// ==========================================
// TRY IT YOURSELF CONTROLLERS
// ==========================================

/**
 * Get Try It Yourself by lesson ID
 */
export const getTryItYourself = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const tryItYourself = await tryItYourselfService.getTryItYourselfByLessonId(lessonId);
  
  if (!tryItYourself) {
    return successResponse(res, 'This lesson does not have Try It Yourself', null);
  }

  successResponse(res, 'Try It Yourself fetched successfully', {
    try_it_yourself_id: tryItYourself.try_it_yourself_id,
    lesson_id: tryItYourself.lesson_id,
    language: {
      language_id: tryItYourself.language.language_id,
      name: tryItYourself.language.name,
      code: tryItYourself.language.code,
      version: tryItYourself.language.version,
    },
    example_code: tryItYourself.example_code,
    created_at: tryItYourself.created_at,
    updated_at: tryItYourself.updated_at,
  });
});

/**
 * Create Try It Yourself for a lesson (Admin only)
 */
export const createTryItYourself = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const { language_code, example_code } = req.body;

  if (!language_code) {
    throw new BadRequestError('Missing required field: language_code');
  }
  if (!example_code) {
    throw new BadRequestError('Missing required field: example_code');
  }

  const tryItYourself = await tryItYourselfService.createTryItYourself({
    lesson_id: lessonId,
    language_code,
    example_code,
  });

  createdResponse(res, 'Try It Yourself created successfully', tryItYourself);
});

/**
 * Update Try It Yourself (Admin only)
 */
export const updateTryItYourself = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const { language_code, example_code } = req.body;

  const updatedTryItYourself = await tryItYourselfService.updateTryItYourself(lessonId, {
    language_code,
    example_code,
  });

  successResponse(res, 'Try It Yourself updated successfully', updatedTryItYourself);
});

/**
 * Delete Try It Yourself (Admin only)
 */
export const deleteTryItYourself = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  await tryItYourselfService.deleteTryItYourself(lessonId);
  successResponse(res, 'Try It Yourself deleted successfully');
});

/**
 * Run code in Try It Yourself
 * User submits code and gets output back
 */
export const runCode = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) {
    throw new BadRequestError('Invalid Lesson ID');
  }

  const { source_code, input } = req.body;

  if (!source_code) {
    throw new BadRequestError('Missing required field: source_code');
  }

  const result = await tryItYourselfService.runCode(lessonId, {
    source_code,
    input,
  });

  successResponse(res, 'Code executed successfully', result);
});

/**
 * Run code directly with language (without needing a lesson)
 * For playground functionality
 */
export const runCodeDirect = asyncHandler(async (req: Request, res: Response) => {
  const { language_code, source_code, input } = req.body;

  if (!language_code) {
    throw new BadRequestError('Missing required field: language_code');
  }
  if (!source_code) {
    throw new BadRequestError('Missing required field: source_code');
  }

  const result = await tryItYourselfService.runCodeDirect(language_code, source_code, input);

  successResponse(res, 'Code executed successfully', result);
});

/**
 * Get all supported languages for Try It Yourself
 */
export const getSupportedLanguages = asyncHandler(async (req: Request, res: Response) => {
  const languages = await tryItYourselfService.getSupportedLanguages();
  successResponse(res, 'Supported languages fetched successfully', languages);
});
