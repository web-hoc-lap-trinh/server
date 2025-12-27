import { Request, Response } from 'express';
import * as categoryService from './category.service';
import { successResponse, createdResponse, BadRequestError } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

export const getCategoriesPublic = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories(false);
    successResponse(res, 'Lấy danh sách chủ đề thành công', categories);
});

export const getCategoryPublic = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) throw new BadRequestError('Invalid Category ID');
    
    const category = await categoryService.getCategoryById(categoryId, false);
    successResponse(res, 'Lấy chi tiết chủ đề thành công', category);
});


export const getCategoriesAdmin = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories(true);
    successResponse(res, 'Lấy danh sách chủ đề (Admin) thành công', categories);
});

export const getCategoryAdmin = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) throw new BadRequestError('Invalid Category ID');
    
    // isAdmin = true
    const category = await categoryService.getCategoryById(categoryId, true);
    successResponse(res, 'Lấy chi tiết chủ đề (Admin) thành công', category);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, order_index } = req.body;
    const iconFile = req.file; 
    const newCategory = await categoryService.createCategory(name, order_index, iconFile as any);
    createdResponse(res, 'Tạo Chủ đề thành công', newCategory);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    
    const { name, order_index, is_active } = req.body; 
    const iconFile = req.file; 
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (order_index !== undefined) updateData.order_index = parseInt(order_index);

    if (is_active !== undefined) {
        updateData.is_active = (String(is_active) === 'true');
    }

    const updatedCategory = await categoryService.updateCategory(categoryId, updateData, iconFile as any);
    successResponse(res, 'Cập nhật Chủ đề thành công', updatedCategory);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const result = await categoryService.deleteCategory(categoryId);
    successResponse(res, result.message);
});