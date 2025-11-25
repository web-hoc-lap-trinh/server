import { Request, Response } from 'express';
import { successResponse, BadRequestError } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
import { uploadToCloudinary } from '../../config/cloudinary';
import { Readable } from 'stream';

/**
 * Upload ảnh/video cho HTML editor trong lesson content
 * Dùng khi user paste/upload media vào WYSIWYG editor
 */
export const uploadLessonMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('Không tìm thấy file');
  }

  // Xác định resource type (image hoặc video)
  const isVideo = req.file.mimetype.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';
  const folderName = isVideo ? 'lesson-videos' : 'lesson-images';

  // Chuyển buffer thành stream để upload lên Cloudinary
  const uploadStream = (buffer: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
      const stream = require('cloudinary').v2.uploader.upload_stream(
        {
          folder: `codery/${folderName}`,
          resource_type: resourceType,
          // Cho video: tự động tạo thumbnail và optimize
          ...(isVideo && {
            eager: [
              { width: 300, height: 300, crop: 'pad', format: 'jpg' } // Thumbnail
            ],
            eager_async: true,
          }),
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const readable = Readable.from(buffer);
      readable.pipe(stream);
    });
  };

  const result = await uploadStream(req.file.buffer);

  const responseData: any = {
    url: result.secure_url,
    public_id: result.public_id,
    resource_type: result.resource_type,
    format: result.format,
  };

  // Thêm thông tin specific cho từng loại
  if (isVideo) {
    responseData.duration = result.duration;
    responseData.thumbnail = result.eager?.[0]?.secure_url || result.secure_url.replace(/\.[^.]+$/, '.jpg');
  } else {
    responseData.width = result.width;
    responseData.height = result.height;
  }

  successResponse(res, `Upload ${isVideo ? 'video' : 'ảnh'} thành công`, responseData);
});

/**
 * Upload nhiều ảnh/video cùng lúc (nếu cần)
 */
export const uploadMultipleLessonMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new BadRequestError('Không tìm thấy file');
  }

  const uploadStream = (buffer: Buffer, mimetype: string): Promise<any> => {
    const isVideo = mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const folderName = isVideo ? 'lesson-videos' : 'lesson-images';

    return new Promise((resolve, reject) => {
      const stream = require('cloudinary').v2.uploader.upload_stream(
        {
          folder: `codery/${folderName}`,
          resource_type: resourceType,
          ...(isVideo && {
            eager: [{ width: 300, height: 300, crop: 'pad', format: 'jpg' }],
            eager_async: true,
          }),
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const readable = Readable.from(buffer);
      readable.pipe(stream);
    });
  };

  const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
    const isVideo = file.mimetype.startsWith('video/');
    const result = await uploadStream(file.buffer, file.mimetype);
    
    const data: any = {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      originalName: file.originalname,
    };

    if (isVideo) {
      data.duration = result.duration;
      data.thumbnail = result.eager?.[0]?.secure_url;
    } else {
      data.width = result.width;
      data.height = result.height;
    }

    return data;
  });

  const uploadedMedia = await Promise.all(uploadPromises);

  successResponse(res, 'Upload thành công', uploadedMedia);
});
