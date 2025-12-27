import { AppDataSource } from '../../config/data-source';
import { Category } from './category.entity';
import { NotFoundError, BadRequestError } from '../../utils/apiResponse';
import uploadToCloudinary from '../../config/cloudinary'; 

const categoryRepository = AppDataSource.getRepository(Category);

export const getAllCategories = async (isAdmin: boolean = false) => {
  const whereCondition = isAdmin ? {} : { is_active: true };
  
  const selectFields = isAdmin 
    ? ['category_id', 'name', 'icon_url', 'order_index', 'is_active', 'created_at']
    : ['category_id', 'name', 'icon_url', 'order_index'];

  return await categoryRepository.find({
    where: whereCondition,
    order: { order_index: 'ASC', name: 'ASC' },
    select: selectFields as (keyof Category)[], 
  });
};

export const getCategoryById = async (categoryId: number, isAdmin: boolean = false) => {
    const whereCondition = isAdmin 
        ? { category_id: categoryId } 
        : { category_id: categoryId, is_active: true };

    const selectFields = isAdmin 
        ? ['category_id', 'name', 'icon_url', 'order_index', 'is_active', 'created_at']
        : ['category_id', 'name', 'icon_url', 'order_index'];

    const category = await categoryRepository.findOne({
        where: whereCondition,
        select: selectFields as (keyof Category)[],
    });

    if (!category) {
        throw new NotFoundError('Không tìm thấy Chủ đề.');
    }
    return category;
};

export const createCategory = async (name: string, order_index?: number, iconFile?: any) => {
  const category = new Category();
  category.name = name;
  if (typeof order_index !== 'undefined') category.order_index = order_index;
  
  if (iconFile) {
    try {
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = uploadToCloudinary.uploader.upload_stream(
          { folder: 'categories' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        uploadStream.end(iconFile.buffer);
      });
      category.icon_url = (cloudinaryResponse as any).secure_url;
    } catch (error) {
      throw new BadRequestError('Upload icon thất bại.');
    }
  }

  category.is_active = true;
  return await categoryRepository.save(category);
};

export const updateCategory = async (categoryId: number, updateData: Partial<Category>, iconFile?: any) => {
  const category = await categoryRepository.findOne({ where: { category_id: categoryId } });
  if (!category) throw new NotFoundError('Không tìm thấy Chủ đề.');

  if (iconFile) {
    try {
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = uploadToCloudinary.uploader.upload_stream(
          { folder: 'categories' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        uploadStream.end(iconFile.buffer);
      });
      category.icon_url = (cloudinaryResponse as any).secure_url;
    } catch (error) {
      throw new BadRequestError('Upload icon thất bại.');
    }
  }

  Object.assign(category, updateData);
  return await categoryRepository.save(category);
};

export const deleteCategory = async (categoryId: number) => {
  const result = await categoryRepository.update({ category_id: categoryId }, { is_active: false });
  if (result.affected === 0) throw new NotFoundError('Không tìm thấy Chủ đề để xóa.');
  return { message: 'Xóa (Deactivate) Chủ đề thành công.' };
};