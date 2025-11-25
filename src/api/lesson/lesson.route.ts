import { Router } from 'express';
import * as lessonController from './lesson.controller';
import * as lessonImageController from './lesson-image.controller';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();

// Multer config for media upload (image & video)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh hoặc video'));
    }
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Lesson fetched successfully
 *         data:
 *           $ref: '#/components/schemas/Lesson'
 *
 *     LessonListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Lessons fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Xóa Bài học thành công.
 */

/**
 * @swagger
 * /api/lessons/upload-media:
 *   post:
 *     summary: "[ADMIN] Upload ảnh/video cho HTML editor trong lesson content"
 *     description: API này dùng khi paste/upload media vào WYSIWYG editor. Trả về URL đã upload lên Cloudinary.
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh (jpg, png, gif, webp...) hoặc video (mp4, webm, mov...) - Max 100MB
 *     responses:
 *       200:
 *         description: Upload thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Upload video thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/video/upload/v1234567890/codery/lesson-videos/abc123.mp4
 *                     public_id:
 *                       type: string
 *                       example: codery/lesson-videos/abc123
 *                     resource_type:
 *                       type: string
 *                       example: video
 *                     duration:
 *                       type: number
 *                       example: 120.5
 *                     thumbnail:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/video/upload/v1234567890/codery/lesson-videos/abc123.jpg
 *       400:
 *         description: File không hợp lệ hoặc quá lớn
 *       403:
 *         description: Không có quyền Admin
 */
router.post('/upload-media', authMiddleware, checkAdmin, upload.single('media'), lessonImageController.uploadLessonMedia);

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Lấy danh sách tất cả các Bài học đã xuất bản (public)
 *     tags: [Lesson]
 *     responses:
 *       200:
 *         description: Danh sách bài học đã xuất bản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonListResponse'
 *
 *   post:
 *     summary: "[ADMIN] Tạo mới một Bài học"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *     responses:
 *       201:
 *         description: Tạo mới thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tạo Bài học thành công
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/', lessonController.getPublishedLessons); 
router.post('/', authMiddleware, checkAdmin, lessonController.createLesson);

/**
 * @swagger
 * /api/lessons/admin:
 *   get:
 *     summary: "[ADMIN] Lấy danh sách tất cả Bài học (bao gồm cả chưa xuất bản)"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả bài học
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonListResponse'
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/admin', authMiddleware, checkAdmin, lessonController.getAllLessonsAdmin);

/**
 * @swagger
 * /api/lessons/category/{categoryId}:
 *   get:
 *     summary: Lấy danh sách Bài học theo Chủ đề (Category ID)
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Chủ đề
 *     responses:
 *       200:
 *         description: Danh sách bài học theo chủ đề
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonListResponse'
 *       400:
 *         description: Category ID không hợp lệ
 */
router.get('/category/:categoryId', lessonController.getLessonsByCategory);

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     summary: Lấy chi tiết một Bài học (public)
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Bài học
 *     responses:
 *       200:
 *         description: Chi tiết bài học
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonResponse'
 *       404:
 *         description: Bài học không tồn tại hoặc chưa xuất bản
 *
 *   put:
 *     summary: "[ADMIN] Cập nhật Bài học"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Bài học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *           examples:
 *             UpdateAndPublish:
 *               summary: Cập nhật nội dung và Xuất bản
 *               value:
 *                 category_id: 1
 *                 title: "Tựa đề bài học đã cập nhật"
 *                 content: "Nội dung bài học dạng HTML đã chỉnh sửa"
 *                 description: "Mô tả ngắn gọn đã sửa"
 *                 difficulty_level: "INTERMEDIATE"
 *                 order_index: 1
 *                 is_published: true
 *             UnpublishLesson:
 *               summary: Chuyển về trạng thái nháp
 *               value:
 *                 is_published: false
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cập nhật Bài học thành công
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       403:
 *         description: Không có quyền Admin
 *
 *   delete:
 *     summary: "[ADMIN] Xóa Bài học"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Bài học
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Không tìm thấy Bài học để xóa
 */
router.get('/:lessonId', lessonController.getLesson);
router.put('/:lessonId', authMiddleware, checkAdmin, lessonController.updateLesson);
router.delete('/:lessonId', authMiddleware, checkAdmin, lessonController.deleteLesson);

export default router;
