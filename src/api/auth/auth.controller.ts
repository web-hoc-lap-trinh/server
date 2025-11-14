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

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await authService.getProfile(req.user!.user_id);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};


export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { email, password, role, ...updateData } = req.body;
    
    const user = await authService.updateProfile(req.user!.user_id, updateData);
    res.json({
      message: 'Cập nhật profile thành công',
      user: user,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const requestChangePassword = async (req: Request, res: Response) => {
  try {
    const result = await authService.requestChangePasswordOtp(req.user!.user_id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyChangePassword = async (req: Request, res: Response) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
      return res.status(400).json({ message: 'Thiếu OTP hoặc mật khẩu mới' });
    }
    
    const result = await authService.verifyChangePassword(
      req.user!.user_id,
      otp,
      newPassword
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
