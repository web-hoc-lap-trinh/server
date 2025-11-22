import { Request, Response } from 'express';
import * as lessonService from './lesson.service';
import { successResponse, createdResponse, BadRequestError } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

export const getLessonsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId); // Lấy categoryId từ path
    if (isNaN(categoryId)) {
        throw new BadRequestError('Invalid Category ID');
    }
    
    const lessons = await lessonService.getLessonsByCategoryId(categoryId);
    successResponse(res, `Lessons fetched for category ${categoryId}`, lessons);
});

export const getLessons = asyncHandler(async (req: Request, res: Response) => {
    const lessons = await lessonService.getAllLessons();
    successResponse(res, 'Lessons fetched successfully', lessons);
});

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = parseInt(req.params.lessonId);
    if (isNaN(lessonId)) {
        throw new BadRequestError('Invalid Lesson ID');
    }

    const lesson = await lessonService.getLessonById(lessonId);
    successResponse(res, 'Lesson fetched successfully', lesson);
});

export const getPublishedLessons = asyncHandler(async (req: Request, res: Response) => {
    const lessons = await lessonService.getPublishedLessons();
    successResponse(res, 'Lessons fetched successfully', lessons);
});

export const getAllLessonsAdmin = asyncHandler(async (req: Request, res: Response) => {
    const lessons = await lessonService.getAllLessonsAdmin();
    successResponse(res, 'All lessons fetched successfully for Admin', lessons);
});

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
    const { category_id, title, content, description, difficulty_level, order_index } = req.body;
    const userId = req.user!.user_id; 
    const newLesson = await lessonService.createLesson({ 
        category_id, 
        title, 
        content, 
        description, 
        difficulty_level, 
        order_index 
    }, userId);

    createdResponse(res, 'Tạo Bài học thành công', newLesson);
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = parseInt(req.params.lessonId);
    const updateData = req.body;
    
    delete updateData.created_by; 

    const updatedLesson = await lessonService.updateLesson(lessonId, updateData);
    successResponse(res, 'Cập nhật Bài học thành công', updatedLesson);
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = parseInt(req.params.lessonId);
    const result = await lessonService.deleteLesson(lessonId);
    successResponse(res, result.message);
});