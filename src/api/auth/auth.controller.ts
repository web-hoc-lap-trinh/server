import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { successResponse, createdResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  createdResponse(res, result.message);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.loginUser(req.body);
  successResponse(res, 'Đăng nhập thành công', data);
});

export const verifyAccount = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.verifyAccount(req.body);
  successResponse(res, 'Xác thực tài khoản thành công', data);
});

export const resendVerificationOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.resendVerificationOtp(email);
  successResponse(res, result.message);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  successResponse(res, result.message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.resetPassword(req.body);
  successResponse(res, 'Đặt lại mật khẩu thành công', { user });
});
// profile handlers moved to feature `src/api/profile`
