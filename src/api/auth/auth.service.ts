import { AppDataSource } from '../../config/data-source';
import { User } from '../user/user.entity';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../../utils/sendEmail';
import 'dotenv/config';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../utils/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET as string;
const userRepository = AppDataSource.getRepository(User);

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

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
    throw new ConflictError('Email đã tồn tại');
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  const otp = generateOtp();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  const user = userRepository.create({
    email,
    password_hash: hashedPassword,
    full_name,
    role: 'STUDENT',
    is_verified: false,
    verification_otp: otp,
    verification_otp_expires: expires,
  });

  await userRepository.save(user);

  await sendEmail(
    email,
    'Chào mừng bạn đến với Codery - Xác thực tài khoản',
    `Mã OTP xác thực tài khoản của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
  );

  return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.' };
};

export const verifyAccount = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const user = await userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .addSelect([
      'user.verification_otp',
      'user.verification_otp_expires',
      'user.is_verified',
    ])
    .getOne();

  if (!user) {
    throw new NotFoundError('Email không tồn tại');
  }

  if (user.is_verified) {
    throw new BadRequestError('Tài khoản đã được xác thực trước đó.');
  }

  if (
    user.verification_otp !== otp ||
    !user.verification_otp_expires ||
    new Date(user.verification_otp_expires) < new Date()
  ) {
    throw new BadRequestError('OTP không hợp lệ hoặc đã hết hạn');
  }

  await userRepository.update(
    { user_id: user.user_id },
    {
      is_verified: true,
      verification_otp: null,
      verification_otp_expires: null,
    }
  );

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  const {
    password_hash,
    reset_otp,
    reset_otp_expires,
    verification_otp,
    verification_otp_expires,
    change_password_otp,
    change_password_otp_expires,
    ...userResult
  } = user;

  (userResult as User).is_verified = true;

  return {
    token,
    user: userResult,
  };
};

export const resendVerificationOtp = async (email: string) => {
  const user = await userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .addSelect(['user.is_verified'])
    .getOne();

  if (!user) {
    throw new NotFoundError('Email không tồn tại');
  }

  if (user.is_verified) {
    throw new BadRequestError('Tài khoản đã được xác thực.');
  }

  const otp = generateOtp();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await userRepository.update(
    { user_id: user.user_id },
    {
      verification_otp: otp,
      verification_otp_expires: expires,
    }
  );

  await sendEmail(
    email,
    'Mã OTP xác thực tài khoản Codery (Gửi lại)',
    `Mã OTP mới của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
  );

  return { message: 'Đã gửi lại OTP. Vui lòng kiểm tra email.' };
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
    .addSelect(['user.password_hash', 'user.is_verified'])
    .getOne();

  if (!user) {
    throw new NotFoundError('Email không tồn tại');
  }

  const isMatch = await bcryptjs.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Sai mật khẩu');
  }

  // Only students need to be verified, admins can login without verification
  if (user.role === 'student' && !user.is_verified) {
    throw new ForbiddenError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email.');
  }

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  const {
    password_hash,
    reset_otp,
    reset_otp_expires,
    verification_otp,
    verification_otp_expires,
    change_password_otp,
    change_password_otp_expires,
    ...userResult
  } = user;

  return {
    token,
    user: userResult,
  };
};

export const forgotPassword = async (email: string) => {
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('Email không tồn tại');
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await userRepository.update(
    { email },
    { reset_otp: otp, reset_otp_expires: expires }
  );

  await sendEmail(email, 'Reset mật khẩu', `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`);
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
    throw new NotFoundError('Email không tồn tại');
  }

  if (
    user.reset_otp !== otp ||
    !user.reset_otp_expires ||
    new Date(user.reset_otp_expires) < new Date()
  ) {
    throw new BadRequestError('OTP không hợp lệ hoặc đã hết hạn');
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

  const { 
    password_hash, 
    reset_otp, 
    reset_otp_expires,
    verification_otp,
    verification_otp_expires,
    change_password_otp,
    change_password_otp_expires,
    ...result 
  } = user;
  return result;
};

