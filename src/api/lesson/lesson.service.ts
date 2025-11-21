import { AppDataSource } from '../../config/data-source';
import { Lesson } from './lesson.entity';
import { NotFoundError, ConflictError } from '../../utils/apiResponse';

const lessonRepository = AppDataSource.getRepository(Lesson);

export const getLessonById = async (lessonId: number) => {
  const lesson = await lessonRepository.findOne({
    where: { lesson_id: lessonId, is_published: true },
    relations: ['category'], 
    select: [
      'lesson_id',
      'title',
      'description',
      'content', 
      'difficulty_level',
      'order_index',
      'view_count',
      'updated_at',
    ] as (keyof Lesson)[],
  });

  if (!lesson) {
    throw new NotFoundError('Lesson not found or not published');
  }

  await lessonRepository.increment({ lesson_id: lessonId }, 'view_count', 1);

  return lesson;
};

export const createLesson = async (
    data: { 
        category_id: number; 
        title: string; 
        content: string; 
        description?: string;
        difficulty_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
        order_index?: number;
    },
    userId: number
) => {
    const existingLesson = await lessonRepository.findOneBy({ title: data.title });
    if (existingLesson) {
        throw new ConflictError('Bài học với tiêu đề này đã tồn tại.');
    }

    const newLesson = lessonRepository.create({
        ...data,
        created_by: userId,
        is_published: false,
    });
    return await lessonRepository.save(newLesson);
};

export const updateLesson = async (lessonId: number, updateData: Partial<Lesson>) => {
    const lesson = await lessonRepository.findOneBy({ lesson_id: lessonId });
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy Bài học.');
    }
    await lessonRepository.update({ lesson_id: lessonId }, updateData);
    return await lessonRepository.findOneBy({ lesson_id: lessonId });
};

export const deleteLesson = async (lessonId: number) => {
    const result = await lessonRepository.delete({ lesson_id: lessonId });
    if (result.affected === 0) {
        throw new NotFoundError('Không tìm thấy Bài học để xóa.');
    }
    return { message: 'Xóa Bài học thành công.' };
};