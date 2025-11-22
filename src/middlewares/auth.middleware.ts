import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { errorResponse } from '../utils/apiResponse';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  user_id: number;
  role: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Không có token, yêu cầu bị từ chối', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    req.user = decoded; 
    next();
  } catch (err) {
    return errorResponse(res, 'Token không hợp lệ', 401);
  }
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return errorResponse(res, 'Bạn không có quyền truy cập chức năng này', 403);
  }
};