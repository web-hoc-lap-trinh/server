import { Request, Response } from 'express';
import * as authService from './auth.service'; 

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body); 
    res.status(201).json({
      message: 'Đăng ký thành công',
      user: user,
    });
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