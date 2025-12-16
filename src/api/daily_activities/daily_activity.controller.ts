import { Request, Response } from 'express';
import * as dailyActivityService from './daily_activity.service';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';


export const getTodayActivity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.user_id;

    const activity = await dailyActivityService.getDailyActivity(userId);

    successResponse(res, 'Fetched daily activity successfully', activity);
});

export const getActivitiesHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.user_id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await dailyActivityService.getActivitiesHistory(userId, page, limit);

    successResponse(res, 'Fetched activities history successfully', result);
});