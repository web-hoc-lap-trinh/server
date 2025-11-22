import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../utils/apiResponse';

const storage = multer.memoryStorage(); 

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

export const uploadSingleImage = (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            throw new BadRequestError(`Lỗi Upload: ${err.message}`);
        } else if (err) {
            throw new BadRequestError(err.message);
        }
        if (req.file) {
            req.body.fileDataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            req.body.fileName = req.file.originalname;
        }
        next();
    });
};