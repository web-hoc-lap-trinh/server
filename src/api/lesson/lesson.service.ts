import { AppDataSource } from '../../config/data-source';
import { Lesson } from './lesson.entity';
import { TryItYourself } from './try-it-yourself.entity';
import { Language } from '../problem/language.entity';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/apiResponse';

const lessonRepository = AppDataSource.getRepository(Lesson);
const tryItYourselfRepository = AppDataSource.getRepository(TryItYourself);
const languageRepository = AppDataSource.getRepository(Language);

export const getLessonsByCategoryId = async (categoryId: number) => {
    return await lessonRepository.find({
        where: { 
            category_id: categoryId, 
            is_published: true 
        },
        relations: ['category'],
        order: { order_index: 'ASC', updated_at: 'DESC' },
        select: [
            'lesson_id',
            'title',
            'description',
            'difficulty_level',
            'order_index',
            'view_count',
            'updated_at',
            'category_id'
        ] as (keyof Lesson)[],
    });
};

export const getAllLessons = async () => {
    return await lessonRepository.find({
        where: { is_published: true },
        relations: ['category'],
        order: { order_index: 'ASC', updated_at: 'DESC' },
        select: [
            'lesson_id',
            'title',
            'description',
            'difficulty_level',
            'order_index',
            'view_count',
            'updated_at',
            'category_id'
        ] as (keyof Lesson)[],
    });
};

export const getLessonById = async (lessonId: number) => {
  const lesson = await lessonRepository.findOne({
    where: { lesson_id: lessonId, is_published: true },
    relations: ['category', 'tryItYourself', 'tryItYourself.language'], 
  });

  if (!lesson) {
    throw new NotFoundError('Lesson not found or not published');
  }

  await lessonRepository.increment({ lesson_id: lessonId }, 'view_count', 1);

  return lesson;
};

export const getPublishedLessons = async () => {
  return await lessonRepository.find({
    where: { is_published: true },
    relations: ['category'],
    order: { order_index: 'ASC', title: 'ASC' },
    select: [
      'lesson_id',
      'category_id',
      'title',
      'description',
      'difficulty_level',
      'order_index',
      'view_count',
      'updated_at',
    ] as (keyof Lesson)[],
  });
};

export const getAllLessonsAdmin = async () => {
  return await lessonRepository.find({
    relations: ['category'], 
    order: { updated_at: 'DESC', order_index: 'ASC' }, 
    select: [
      'lesson_id',
      'category_id',
      'title',
      'description',
      'difficulty_level',
      'order_index',
      'is_published',
      'view_count',
      'created_by', 
      'created_at',
      'updated_at',
    ] as (keyof Lesson)[],
  });
};

export const createLesson = async (
    data: { 
        category_id: number; 
        title: string; 
        content: string; 
        description?: string;
        difficulty_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
        order_index?: number;
        try_it_yourself?: {
            language_code: string;
            example_code: string;
        };
    },
    userId: number
) => {
    const existingLesson = await lessonRepository.findOneBy({ title: data.title });
    if (existingLesson) {
        throw new ConflictError('Bài học với tiêu đề này đã tồn tại.');
    }

    // Validate language if try_it_yourself is provided
    let languageId: number | undefined;
    if (data.try_it_yourself) {
        const language = await languageRepository.findOne({
            where: { code: data.try_it_yourself.language_code, is_active: true },
        });
        if (!language) {
            throw new BadRequestError(`Language '${data.try_it_yourself.language_code}' is not supported or not active`);
        }
        languageId = language.language_id;
    }

    // Create lesson
    const { try_it_yourself, ...lessonData } = data;
    const newLesson = lessonRepository.create({
        ...lessonData,
        created_by: userId,
        is_published: false,
    });
    const savedLesson = await lessonRepository.save(newLesson);

    // Create Try It Yourself if provided
    if (try_it_yourself && languageId) {
        const tryItYourself = tryItYourselfRepository.create({
            lesson_id: savedLesson.lesson_id,
            language_id: languageId,
            example_code: try_it_yourself.example_code,
        });
        await tryItYourselfRepository.save(tryItYourself);
    }

    // Return lesson with try_it_yourself relation
    return await lessonRepository.findOne({
        where: { lesson_id: savedLesson.lesson_id },
        relations: ['tryItYourself', 'tryItYourself.language'],
    });
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

export const getLessonByIdAdmin = async (lessonId: number) => {
  const lesson = await lessonRepository.findOne({
    where: { lesson_id: lessonId }, 
    relations: ['category', 'tryItYourself', 'tryItYourself.language', 'created_by_user'],
  });

  if (!lesson) {
    throw new NotFoundError('Không tìm thấy bài học');
  }

  return lesson;
};