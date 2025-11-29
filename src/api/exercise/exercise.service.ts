import { AppDataSource } from '../../config/data-source';
import { Exercise, ExerciseType, ExerciseOption } from './exercise.entity';
import { NotFoundError, BadRequestError } from '../../utils/apiResponse';

const exerciseRepository = AppDataSource.getRepository(Exercise);

/**
 * Interface for exercise response with navigation info
 */
export interface ExerciseWithNavigation {
  exercise: Exercise;
  navigation: {
    current_index: number;       // 1-based index
    total_questions: number;
    remaining_questions: number;
    is_first: boolean;
    is_last: boolean;
    next_exercise_id: number | null;
    prev_exercise_id: number | null;
  };
}

/**
 * Interface for answer submission result
 */
export interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string | null;
  navigation: ExerciseWithNavigation['navigation'];
}

/**
 * Get all exercises for a lesson (summary)
 */
export const getExercisesByLessonId = async (lessonId: number) => {
  const exercises = await exerciseRepository.find({
    where: { lesson_id: lessonId },
    order: { order_index: 'ASC' },
    select: ['exercise_id', 'question', 'exercise_type', 'order_index'],
  });

  return {
    lesson_id: lessonId,
    total_questions: exercises.length,
    exercises: exercises.map((ex, index) => ({
      exercise_id: ex.exercise_id,
      question_preview: ex.question.substring(0, 100) + (ex.question.length > 100 ? '...' : ''),
      exercise_type: ex.exercise_type,
      order: index + 1,
    })),
  };
};

/**
 * Get a single exercise with navigation info
 */
export const getExerciseById = async (exerciseId: number): Promise<ExerciseWithNavigation> => {
  const exercise = await exerciseRepository.findOne({
    where: { exercise_id: exerciseId },
    select: ['exercise_id', 'lesson_id', 'question', 'exercise_type', 'options', 'order_index'],
  });

  if (!exercise) {
    throw new NotFoundError('Không tìm thấy bài tập');
  }

  // Get all exercises in this lesson to calculate navigation
  const allExercises = await exerciseRepository.find({
    where: { lesson_id: exercise.lesson_id },
    order: { order_index: 'ASC' },
    select: ['exercise_id', 'order_index'],
  });

  const currentIdx = allExercises.findIndex(ex => ex.exercise_id === exerciseId);
  const navigation = {
    current_index: currentIdx + 1,
    total_questions: allExercises.length,
    remaining_questions: allExercises.length - (currentIdx + 1),
    is_first: currentIdx === 0,
    is_last: currentIdx === allExercises.length - 1,
    next_exercise_id: currentIdx < allExercises.length - 1 ? allExercises[currentIdx + 1].exercise_id : null,
    prev_exercise_id: currentIdx > 0 ? allExercises[currentIdx - 1].exercise_id : null,
  };

  return { exercise, navigation };
};

/**
 * Get first exercise of a lesson
 */
export const getFirstExercise = async (lessonId: number): Promise<ExerciseWithNavigation | null> => {
  const exercises = await exerciseRepository.find({
    where: { lesson_id: lessonId },
    order: { order_index: 'ASC' },
    select: ['exercise_id'],
    take: 1,
  });

  if (exercises.length === 0) {
    return null;
  }

  return getExerciseById(exercises[0].exercise_id);
};

/**
 * Submit answer and check result
 */
export const submitAnswer = async (exerciseId: number, userAnswer: string): Promise<AnswerResult> => {
  const exercise = await exerciseRepository.findOne({
    where: { exercise_id: exerciseId },
  });

  if (!exercise) {
    throw new NotFoundError('Không tìm thấy bài tập');
  }

  // Validate answer format
  const validAnswers = exercise.exercise_type === ExerciseType.TRUE_FALSE 
    ? ['TRUE', 'FALSE'] 
    : ['A', 'B', 'C', 'D'];

  const normalizedAnswer = userAnswer.toUpperCase().trim();
  if (!validAnswers.includes(normalizedAnswer)) {
    throw new BadRequestError(`Câu trả lời không hợp lệ. Vui lòng chọn: ${validAnswers.join(', ')}`);
  }

  const isCorrect = normalizedAnswer === exercise.correct_answer;

  // Get navigation info
  const allExercises = await exerciseRepository.find({
    where: { lesson_id: exercise.lesson_id },
    order: { order_index: 'ASC' },
    select: ['exercise_id'],
  });

  const currentIdx = allExercises.findIndex(ex => ex.exercise_id === exerciseId);
  const navigation = {
    current_index: currentIdx + 1,
    total_questions: allExercises.length,
    remaining_questions: allExercises.length - (currentIdx + 1),
    is_first: currentIdx === 0,
    is_last: currentIdx === allExercises.length - 1,
    next_exercise_id: currentIdx < allExercises.length - 1 ? allExercises[currentIdx + 1].exercise_id : null,
    prev_exercise_id: currentIdx > 0 ? allExercises[currentIdx - 1].exercise_id : null,
  };

  return {
    is_correct: isCorrect,
    correct_answer: exercise.correct_answer,
    explanation: exercise.explanation,
    navigation,
  };
};

// ==================== ADMIN FUNCTIONS ====================

/**
 * Get all exercises for a lesson (Admin - includes correct answers)
 */
export const getExercisesByLessonIdAdmin = async (lessonId: number) => {
  return await exerciseRepository.find({
    where: { lesson_id: lessonId },
    order: { order_index: 'ASC' },
  });
};

/**
 * Get single exercise with all details (Admin)
 */
export const getExerciseByIdAdmin = async (exerciseId: number) => {
  const exercise = await exerciseRepository.findOne({
    where: { exercise_id: exerciseId },
    relations: ['lesson'],
  });

  if (!exercise) {
    throw new NotFoundError('Không tìm thấy bài tập');
  }

  return exercise;
};

/**
 * Create new exercise
 */
export const createExercise = async (data: {
  lesson_id: number;
  question: string;
  exercise_type: ExerciseType;
  options: ExerciseOption[];
  correct_answer: string;
  explanation?: string;
  order_index?: number;
}) => {
  // Validate options based on exercise type
  if (data.exercise_type === ExerciseType.TRUE_FALSE) {
    if (data.options.length !== 2) {
      throw new BadRequestError('Bài tập đúng/sai phải có đúng 2 lựa chọn');
    }
    if (!['TRUE', 'FALSE'].includes(data.correct_answer.toUpperCase())) {
      throw new BadRequestError('Câu trả lời đúng phải là TRUE hoặc FALSE');
    }
  } else {
    if (data.options.length < 2 || data.options.length > 4) {
      throw new BadRequestError('Bài tập trắc nghiệm phải có từ 2 đến 4 lựa chọn');
    }
    if (!['A', 'B', 'C', 'D'].slice(0, data.options.length).includes(data.correct_answer.toUpperCase())) {
      throw new BadRequestError(`Câu trả lời đúng phải là một trong: ${['A', 'B', 'C', 'D'].slice(0, data.options.length).join(', ')}`);
    }
  }

  // Auto set order_index if not provided
  if (data.order_index === undefined) {
    const lastExercise = await exerciseRepository.findOne({
      where: { lesson_id: data.lesson_id },
      order: { order_index: 'DESC' },
    });
    data.order_index = lastExercise ? lastExercise.order_index + 1 : 0;
  }

  const exercise = exerciseRepository.create({
    ...data,
    correct_answer: data.correct_answer.toUpperCase(),
  });

  return await exerciseRepository.save(exercise);
};

/**
 * Update exercise
 */
export const updateExercise = async (exerciseId: number, updateData: Partial<{
  question: string;
  exercise_type: ExerciseType;
  options: ExerciseOption[];
  correct_answer: string;
  explanation: string;
  order_index: number;
}>) => {
  const exercise = await exerciseRepository.findOneBy({ exercise_id: exerciseId });
  if (!exercise) {
    throw new NotFoundError('Không tìm thấy bài tập');
  }

  // Validate if updating answer and options
  if (updateData.correct_answer || updateData.options || updateData.exercise_type) {
    const type = updateData.exercise_type || exercise.exercise_type;
    const options = updateData.options || exercise.options;
    const answer = (updateData.correct_answer || exercise.correct_answer).toUpperCase();

    if (type === ExerciseType.TRUE_FALSE) {
      if (options.length !== 2) {
        throw new BadRequestError('Bài tập đúng/sai phải có đúng 2 lựa chọn');
      }
      if (!['TRUE', 'FALSE'].includes(answer)) {
        throw new BadRequestError('Câu trả lời đúng phải là TRUE hoặc FALSE');
      }
    } else {
      if (options.length < 2 || options.length > 4) {
        throw new BadRequestError('Bài tập trắc nghiệm phải có từ 2 đến 4 lựa chọn');
      }
      if (!['A', 'B', 'C', 'D'].slice(0, options.length).includes(answer)) {
        throw new BadRequestError(`Câu trả lời đúng phải là một trong: ${['A', 'B', 'C', 'D'].slice(0, options.length).join(', ')}`);
      }
    }

    if (updateData.correct_answer) {
      updateData.correct_answer = answer;
    }
  }

  await exerciseRepository.update({ exercise_id: exerciseId }, updateData);
  return await exerciseRepository.findOneBy({ exercise_id: exerciseId });
};

/**
 * Delete exercise
 */
export const deleteExercise = async (exerciseId: number) => {
  const result = await exerciseRepository.delete({ exercise_id: exerciseId });
  if (result.affected === 0) {
    throw new NotFoundError('Không tìm thấy bài tập để xóa');
  }
  return { message: 'Xóa bài tập thành công' };
};

/**
 * Reorder exercises in a lesson
 */
export const reorderExercises = async (lessonId: number, exerciseOrders: { exercise_id: number; order_index: number }[]) => {
  for (const item of exerciseOrders) {
    await exerciseRepository.update(
      { exercise_id: item.exercise_id, lesson_id: lessonId },
      { order_index: item.order_index }
    );
  }

  return await getExercisesByLessonIdAdmin(lessonId);
};
