import { AppDataSource } from '../../config/data-source';
import { User } from '../auth/user.entity';
import bcryptjs from 'bcryptjs';
import sendEmail from '../../utils/sendEmail';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../../utils/apiResponse';
import uploadToCloudinary from '../../config/cloudinary';

const userRepository = AppDataSource.getRepository(User);

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const getProfile = async (userId: number) => {
    const user = await userRepository.findOne({
        where: { user_id: userId },
        select: [
            'user_id',
            'email',
            'full_name',
            'avatar_url',
            'role',
            'total_score',
            'solved_problems',
            'current_streak',
            'max_streak',
            'last_active',
            'is_verified',
            'created_at',
            'updated_at',
        ],
    });

    if (!user) {
        throw new NotFoundError('Không tìm thấy người dùng.');
    }
    return user;
};

export const updateProfile = async (
    userId: number, 
    body: { full_name?: string; }, 
    avatarFile?: any, 
) => {
    const updateData: { full_name?: string; avatar_url?: string } = {};

    if (body.full_name) updateData.full_name = body.full_name;

    if (avatarFile) {
      try {
        const cloudinaryResponse = await new Promise((resolve, reject) => {
          const uploadStream = uploadToCloudinary.uploader.upload_stream(
            { folder: 'avatars' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(avatarFile.buffer);
        });

        updateData.avatar_url = (cloudinaryResponse as any).secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new BadRequestError('Upload ảnh đại diện thất bại.');
      }
    }


    if (Object.keys(updateData).length === 0) {
        return getProfile(userId);
    }
  
    const result = await userRepository.update({ user_id: userId }, updateData);
    
    if (result.affected === 0) {
        throw new NotFoundError('Không tìm thấy người dùng để cập nhật.');
    }
    return getProfile(userId);
};

export const changePassword = async (userId: number, oldPassword: string, newPassword: string) => {
    const user = await userRepository
        .createQueryBuilder('user')
        .where('user.user_id = :userId', { userId })
        .addSelect('user.password_hash')
        .getOne();

    if (!user) {
        throw new NotFoundError('Người dùng không tồn tại.');
    }

    const isValidPassword = await bcryptjs.compare(oldPassword, user.password_hash);
    if (!isValidPassword) {
        throw new UnauthorizedError('Mật khẩu hiện tại không đúng.');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await userRepository.update(
        { user_id: userId },
        { password_hash: hashedPassword }
    );

    return getProfile(userId);
};


