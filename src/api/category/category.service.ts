import { AppDataSource } from '../../config/data-source';
import { Category } from './category.entity';
import { NotFoundError, BadRequestError } from '../../utils/apiResponse';
import uploadToCloudinary from '../../config/cloudinary'; 

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

export const createCategory = async (name: string, order_index?: number, iconFile?: any) => {
  const category = new Category();
  category.name = name;
  if (typeof order_index !== 'undefined') {
    category.order_index = order_index;
  }
  
  if (iconFile) {
    try {
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = uploadToCloudinary.uploader.upload_stream(
          { folder: 'categories' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(iconFile.buffer);
      });

      category.icon_url = (cloudinaryResponse as any).secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw new BadRequestError('Upload icon thất bại.');
    }
  }

  category.is_active = true;
  const saved = await categoryRepository.save(category);
  return saved;
};

export const updateCategory = async (categoryId: number, updateData: Partial<Category>, iconFile?: any) => {
  const category = await categoryRepository.findOne({
    where: { category_id: categoryId },
  });

  if (!category || category.is_active === false) {
    throw new NotFoundError('Không tìm thấy Chủ đề.');
  }

  if (iconFile) {
    try {
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = uploadToCloudinary.uploader.upload_stream(
          { folder: 'categories' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(iconFile.buffer);
      });

      category.icon_url = (cloudinaryResponse as any).secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw new BadRequestError('Upload icon thất bại.');
    }
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