import { Request, Response } from 'express';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res
      .status(err.message === 'Email đã tồn tại' ? 400 : 500)
      .json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = await authService.loginUser(req.body);
    res.json({
      message: 'Đăng nhập thành công',
      ...data,
    });
  } catch (err: any) {
    const status =
      err.message === 'Tài khoản chưa được xác thực.'
        ? 403
        : 401;
    res.status(status).json({ message: err.message });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const data = await authService.verifyAccount(req.body);
    res.json({
      message: 'Xác thực tài khoản thành công',
      ...data,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const resendVerificationOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationOtp(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const user = await authService.resetPassword(req.body);
    res.json({
      message: 'Đặt lại mật khẩu thành công',
      user,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const data = await authService.adminLogin(req.body);
    res.json({
      message: 'Admin đăng nhập thành công',
      ...data,
    });
  } catch (err: any) {
    res
      .status(
        err.message === 'Email không tồn tại' ||
          err.message === 'Tài khoản không có quyền Admin' ||
          err.message === 'Sai mật khẩu'
          ? 401
          : 500
      )
      .json({ message: err.message });
  }
};
