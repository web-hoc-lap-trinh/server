import { AppDataSource } from '../../config/data-source';
import { Category } from './category.entity';
import { BadRequestError, NotFoundError } from '../../utils/apiResponse';

const categoryRepository = AppDataSource.getRepository(Category);

export const getAllCategories = async () => {
  return await categoryRepository.find({
    where: { is_active: true },
    order: { order_index: 'ASC', name: 'ASC' },
    select: ['category_id', 'name', 'icon_url', 'order_index'] as (keyof Category)[], 
  });
};

export const createCategory = async (name: string, order_index: number = 0, icon_url?: string) => {
    const existingCategory = await categoryRepository.findOneBy({ name });
    if (existingCategory) {
        throw new BadRequestError('Chủ đề này đã tồn tại.');
    }

    const newCategory = categoryRepository.create({ name, order_index, icon_url });
    return await categoryRepository.save(newCategory);
};

export const updateCategory = async (categoryId: number, updateData: Partial<Category>) => {
    const category = await categoryRepository.findOneBy({ category_id: categoryId });
    if (!category) {
        throw new NotFoundError('Không tìm thấy Chủ đề.');
    }
    
    if (updateData.name && updateData.name !== category.name) {
        const existingCategory = await categoryRepository.findOneBy({ name: updateData.name });
        if (existingCategory && existingCategory.category_id !== categoryId) {
            throw new BadRequestError('Tên Chủ đề đã được sử dụng.');
        }
    }

    await categoryRepository.update({ category_id: categoryId }, updateData);
    return await categoryRepository.findOneBy({ category_id: categoryId });
};

export const deleteCategory = async (categoryId: number) => {
    const result = await categoryRepository.update({ category_id: categoryId }, { is_active: false });
    if (result.affected === 0) {
        throw new NotFoundError('Không tìm thấy Chủ đề để xóa.');
    }
    return { message: 'Xóa (Deactivate) Chủ đề thành công.' };
};