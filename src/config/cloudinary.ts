import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình kết nối Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Bật https
});

/**
 * Hàm upload file lên Cloudinary
 * @param filePath Đường dẫn tạm thời của file (từ Multer)
 * @param folder Tên folder trên Cloudinary
 * @returns Object chứa thông tin upload, bao gồm secure_url
 */
export const uploadToCloudinary = async (filePath: string, folder: string) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: `codery/${folder}`,
  });
};

export default cloudinary;