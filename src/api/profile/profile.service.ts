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
            const cloudinaryResponse = await uploadToCloudinary.uploader.upload(avatarFile.path, { folder: 'avatars' });
            updateData.avatar_url = cloudinaryResponse.secure_url; 

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

export const changePassword = async (userId: number, currentPassword: string, newPassword: string) => {
    const user = await userRepository
        .createQueryBuilder('user')
        .where('user.user_id = :userId', { userId })
        .addSelect('user.password_hash')
        .getOne();

    if (!user || !(await bcryptjs.compare(currentPassword, user.password_hash))) {
        throw new UnauthorizedError('Mật khẩu hiện tại không đúng.');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await userRepository.update(
        { user_id: userId }, 
        { password_hash: hashedPassword }
    );
    
    return getProfile(userId); 
};

export const requestChangePasswordOtp = async (userId: number) => {
  const user = await userRepository.findOne({ where: { user_id: userId } });
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  const otp = generateOtp();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await userRepository.update(
    { user_id: userId },
    {
      change_password_otp: otp,
      change_password_otp_expires: expires,
    }
  );

  await sendEmail(
    user.email,
    'Xác nhận thay đổi mật khẩu Codery',
    `Mã OTP để thay đổi mật khẩu của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
  );

  return { message: 'Đã gửi OTP xác nhận qua email.' };
};

export const verifyChangePassword = async (
  userId: number,
  otp: string,
  newPassword: string
) => {
  const user = await userRepository
    .createQueryBuilder('user')
    .where('user.user_id = :userId', { userId })
    .addSelect([
      'user.change_password_otp',
      'user.change_password_otp_expires',
    ])
    .getOne();

  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  if (
    user.change_password_otp !== otp ||
    !user.change_password_otp_expires ||
    new Date(user.change_password_otp_expires) < new Date()
  ) {
    throw new BadRequestError('OTP không hợp lệ hoặc đã hết hạn');
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10);

  await userRepository.update(
    { user_id: userId },
    {
      password_hash: hashedPassword,
      change_password_otp: null,
      change_password_otp_expires: null,
    }
  );
  return getProfile(userId);
};


