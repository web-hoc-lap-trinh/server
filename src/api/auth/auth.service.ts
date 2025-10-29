import { AppDataSource } from '../../config/data-source'; 
import { User } from './user.entity'; 
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../../utils/sendEmail';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET as string;
const userRepository = AppDataSource.getRepository(User);

export const registerUser = async ({
  email,
  password,
  full_name,
}: {
  email: string;
  password: string;
  full_name: string;
}) => {
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email đã tồn tại');
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = userRepository.create({
    email,
    password_hash: hashedPassword,
    full_name,
    role: 'student',
  });

  await userRepository.save(user);

  const { password_hash, reset_otp, reset_otp_expires, ...result } = user;
  return result;
};

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .addSelect('user.password_hash')
    .getOne();

  if (!user) {
    throw new Error('Email không tồn tại');
  }

  const isMatch = await bcryptjs.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Sai mật khẩu');
  }

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  const { password_hash, ...userResult } = user;
  return {
    token,
    user: userResult,
  };
};

export const forgotPassword = async (email: string) => {
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    throw new Error('Email không tồn tại');
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); 

  await userRepository.update(
    { email },
    { reset_otp: otp, reset_otp_expires: expires } 
  );

  await sendEmail(email, 'Reset mật khẩu', `Mã OTP của bạn là: ${otp}`);
  return { message: 'OTP đã được gửi qua email' };
};

export const resetPassword = async ({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const user = await userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .addSelect(['user.reset_otp', 'user.reset_otp_expires'])
    .getOne();

  if (!user) {
    throw new Error('Email không tồn tại');
  }

  if (
    user.reset_otp !== otp ||
    !user.reset_otp_expires ||
    new Date(user.reset_otp_expires) < new Date()
  ) {
    throw new Error('OTP không hợp lệ hoặc đã hết hạn');
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10);

  await userRepository.update(
    { email },
    {
      password_hash: hashedPassword,
      reset_otp: null,
      reset_otp_expires: null,
    }
  );

  const { password_hash, reset_otp, reset_otp_expires, ...result } = user;
  return result;
};