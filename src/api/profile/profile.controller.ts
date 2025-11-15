import { Request, Response } from 'express';
import * as profileService from './profile.service';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await profileService.getProfile(req.user!.user_id);
  successResponse(res, 'Lấy thông tin profile thành công', { user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role, ...updateData } = req.body;
  const user = await profileService.updateProfile(req.user!.user_id, updateData);
  successResponse(res, 'Cập nhật profile thành công', { user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const result = await profileService.changePassword(req.user!.user_id, oldPassword, newPassword);
  successResponse(res, result.message);
});

export const requestChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await profileService.requestChangePasswordOtp(req.user!.user_id);
  successResponse(res, result.message);
});

export const verifyChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const { otp, newPassword } = req.body;
  const result = await profileService.verifyChangePassword(req.user!.user_id, otp, newPassword);
  successResponse(res, result.message);
});
