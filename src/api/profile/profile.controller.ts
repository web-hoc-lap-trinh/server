import { Request, Response } from 'express';
import * as profileService from './profile.service';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
import { BadRequestError } from '../../utils/apiResponse';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.user_id;
  const user = await profileService.getProfile(userId);
  successResponse(res, 'Lấy thông tin profile thành công', { user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role, ...updateData } = req.body;
  const avatarFile = req.file; 
  const user = await profileService.updateProfile(
    req.user!.user_id, 
    updateData, 
    avatarFile as any
  );
  successResponse(res, 'Cập nhật profile thành công', { user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.user_id;
  const user = await profileService.changePassword(userId, currentPassword, newPassword);
  successResponse(res, 'Đổi mật khẩu thành công', { user }); 
});

export const requestChangePassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await profileService.requestChangePasswordOtp(req.user!.user_id);
    successResponse(res, result.message);
});

export const verifyChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const { otp, newPassword } = req.body;
  const userId = req.user!.user_id;
  const user = await profileService.verifyChangePassword(userId, otp, newPassword); 
  successResponse(res, 'Đổi mật khẩu thành công', { user });
});