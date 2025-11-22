import { Request, Response } from 'express';
import * as categoryService from './category.service';
import { successResponse, createdResponse, BadRequestError } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    successResponse(res, 'Categories fetched successfully', categories);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
        throw new BadRequestError('Invalid Category ID');
    }
    const category = await categoryService.getCategoryById(categoryId);
    successResponse(res, 'Category fetched successfully', category);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, order_index } = req.body;
    const fileDataUri = req.body.fileDataUri as string | undefined;

    const newCategory = await categoryService.createCategory(name, order_index, fileDataUri);
    createdResponse(res, 'Tạo Chủ đề thành công', newCategory);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const updateData = req.body;
    
    const fileDataUri = req.body.fileDataUri as string | undefined;

    delete updateData.fileDataUri;
    
    const updatedCategory = await categoryService.updateCategory(categoryId, updateData, fileDataUri);
    successResponse(res, 'Cập nhật Chủ đề thành công', updatedCategory);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const result = await categoryService.deleteCategory(categoryId);
    successResponse(res, result.message);
});