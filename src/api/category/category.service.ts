import { AppDataSource } from '../../config/data-source';
import { Category } from './category.entity';
import { NotFoundError } from '../../utils/apiResponse';

const categoryRepository = AppDataSource.getRepository(Category);

export const getAllCategories = async () => {
  return await categoryRepository.find({
    where: { is_active: true },
    order: { order_index: 'ASC', name: 'ASC' },
    select: ['category_id', 'name', 'icon_url', 'order_index'] as (keyof Category)[], 
  });
};

export const getCategoryById = async (categoryId: number) => {
    const category = await categoryRepository.findOne({
        where: { category_id: categoryId, is_active: true },
        select: ['category_id', 'name', 'icon_url', 'order_index', 'created_at'] as (keyof Category)[],
    });

    if (!category) {
        throw new NotFoundError('Không tìm thấy Chủ đề.');
    }
    return category;
};

export const createCategory = async (name: string, order_index?: number, fileDataUri?: string) => {
  const category = new Category();
  category.name = name;
  if (typeof order_index !== 'undefined') {
    category.order_index = order_index;
  }
  if (fileDataUri) {
    category.icon_url = fileDataUri;
  }
  category.is_active = true;
  const saved = await categoryRepository.save(category);
  return saved;
};

export const updateCategory = async (categoryId: number, updateData: Partial<Category>, fileDataUri?: string) => {
  const category = await categoryRepository.findOne({
    where: { category_id: categoryId },
  });

  if (!category || category.is_active === false) {
    throw new NotFoundError('Không tìm thấy Chủ đề.');
  }

  if (fileDataUri) {
    category.icon_url = fileDataUri;
  }

  Object.assign(category, updateData);

  const saved = await categoryRepository.save(category);
  return saved;
};

export const deleteCategory = async (categoryId: number) => {
  const result = await categoryRepository.update({ category_id: categoryId }, { is_active: false });
  if (result.affected === 0) {
    throw new NotFoundError('Không tìm thấy Chủ đề để xóa.');
  }
  return { message: 'Xóa (Deactivate) Chủ đề thành công.' };
};