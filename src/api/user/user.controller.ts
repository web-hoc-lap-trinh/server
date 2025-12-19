import { Request, Response } from 'express';
import * as userService from './user.service';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUserResponse:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           example: 89393637
 *         full_name:
 *           type: string
 *           example: "Phạm Hà Anh Thư"
 *         avatar_url:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         last_active:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [ACTIVE, BLOCKED]
 *           example: "ACTIVE"
 */

export const listUsersForAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const { search, sort } = req.query;

    const users = await userService.getAdminUserList(
      search as string,
      sort as string
    );

    successResponse(res, 'Lấy danh sách thành công', users);
  }
);

export const toggleUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const user = await userService.updateUserStatus(Number(id), status);

    successResponse(res, 'Cập nhật trạng thái thành công', user);
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await userService.deleteUser(Number(id));

    successResponse(res, 'Xóa người dùng thành công');
  }
);
