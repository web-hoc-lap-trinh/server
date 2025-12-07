import { Request, Response } from 'express';
import * as profileService from './profile.service';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

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
  const { oldPassword, newPassword } = req.body; 

  if (!oldPassword || !newPassword) {
    throw new Error("Missing required fields");
  }

  const userId = req.user!.user_id;

  await profileService.changePassword(userId, oldPassword, newPassword); 

  successResponse(res, 'Đổi mật khẩu thành công');
});