import { AppDataSource } from '../../config/data-source';
import { Exercise, ExerciseType, ExerciseOption } from './exercise.entity';
import { ExerciseSubmission } from './exercise-submission.entity';
import { NotFoundError, BadRequestError } from '../../utils/apiResponse';

const exerciseRepository = AppDataSource.getRepository(Exercise);
const submissionRepository = AppDataSource.getRepository(ExerciseSubmission);

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
export const submitAnswer = async (
  exerciseId: number, 
  userAnswer: string, 
  userId: number,
  timeSpentSeconds?: number
): Promise<AnswerResult> => {
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

  // Calculate attempt number for this user and exercise
  const previousAttempts = await submissionRepository.count({
    where: { user_id: userId, exercise_id: exerciseId },
  });

  // Save submission to history
  const submission = submissionRepository.create({
    user_id: userId,
    exercise_id: exerciseId,
    lesson_id: exercise.lesson_id,
    user_answer: normalizedAnswer,
    correct_answer: exercise.correct_answer,
    is_correct: isCorrect,
    time_spent_seconds: timeSpentSeconds || null,
    attempt_number: previousAttempts + 1,
  });

  await submissionRepository.save(submission);

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

// ==================== SUBMISSION HISTORY FUNCTIONS ====================

/**
 * Get submission history for a specific exercise by user
 */
export const getExerciseSubmissionHistory = async (userId: number, exerciseId: number) => {
  const submissions = await submissionRepository.find({
    where: { user_id: userId, exercise_id: exerciseId },
    order: { submitted_at: 'DESC' },
    relations: ['exercise'],
  });

  const totalAttempts = submissions.length;
  const correctAttempts = submissions.filter(s => s.is_correct).length;
  const firstAttemptCorrect = submissions.length > 0 && submissions[submissions.length - 1].is_correct;
  
  return {
    exercise_id: exerciseId,
    total_attempts: totalAttempts,
    correct_attempts: correctAttempts,
    success_rate: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
    first_attempt_correct: firstAttemptCorrect,
    submissions: submissions.map(s => ({
      submission_id: s.submission_id,
      user_answer: s.user_answer,
      correct_answer: s.correct_answer,
      is_correct: s.is_correct,
      time_spent_seconds: s.time_spent_seconds,
      attempt_number: s.attempt_number,
      submitted_at: s.submitted_at,
    })),
  };
};

/**
 * Get all submission history for a lesson by user
 */
export const getLessonSubmissionHistory = async (userId: number, lessonId: number) => {
  const submissions = await submissionRepository.find({
    where: { user_id: userId, lesson_id: lessonId },
    order: { submitted_at: 'DESC' },
    relations: ['exercise'],
  });

  // Group by exercise
  const groupedByExercise = submissions.reduce((acc, sub) => {
    if (!acc[sub.exercise_id]) {
      acc[sub.exercise_id] = [];
    }
    acc[sub.exercise_id].push(sub);
    return acc;
  }, {} as Record<number, ExerciseSubmission[]>);

  // Calculate stats per exercise
  const exerciseStats = Object.entries(groupedByExercise).map(([exerciseId, subs]) => {
    const totalAttempts = subs.length;
    const correctAttempts = subs.filter(s => s.is_correct).length;
    const lastSubmission = subs[0]; // Already sorted DESC
    const firstSubmission = subs[subs.length - 1];

    return {
      exercise_id: parseInt(exerciseId),
      question: subs[0].exercise.question,
      total_attempts: totalAttempts,
      correct_attempts: correctAttempts,
      success_rate: Math.round((correctAttempts / totalAttempts) * 100),
      first_attempt_correct: firstSubmission.is_correct,
      last_attempt_correct: lastSubmission.is_correct,
      last_submitted_at: lastSubmission.submitted_at,
    };
  });

  // Overall lesson stats
  const totalSubmissions = submissions.length;
  const correctSubmissions = submissions.filter(s => s.is_correct).length;
  const uniqueExercises = Object.keys(groupedByExercise).length;

  return {
    lesson_id: lessonId,
    total_submissions: totalSubmissions,
    correct_submissions: correctSubmissions,
    overall_success_rate: totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0,
    unique_exercises_attempted: uniqueExercises,
    exercises: exerciseStats,
  };
};

/**
 * Get all submission history for a user (across all lessons)
 */
export const getUserSubmissionHistory = async (
  userId: number,
  options?: {
    page?: number;
    limit?: number;
    lessonId?: number;
    onlyCorrect?: boolean;
  }
) => {
  const { page = 1, limit = 50, lessonId, onlyCorrect } = options || {};
  const offset = (page - 1) * limit;

  const whereCondition: any = { user_id: userId };
  if (lessonId) whereCondition.lesson_id = lessonId;
  if (onlyCorrect !== undefined) whereCondition.is_correct = onlyCorrect;

  const [submissions, total] = await submissionRepository.findAndCount({
    where: whereCondition,
    order: { submitted_at: 'DESC' },
    relations: ['exercise'],
    take: limit,
    skip: offset,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
    submissions: submissions.map(s => ({
      submission_id: s.submission_id,
      exercise_id: s.exercise_id,
      lesson_id: s.lesson_id,
      question: s.exercise.question,
      user_answer: s.user_answer,
      correct_answer: s.correct_answer,
      is_correct: s.is_correct,
      time_spent_seconds: s.time_spent_seconds,
      attempt_number: s.attempt_number,
      submitted_at: s.submitted_at,
    })),
  };
};

/**
 * Get user statistics across all exercises
 */
export const getUserExerciseStats = async (userId: number) => {
  const submissions = await submissionRepository.find({
    where: { user_id: userId },
  });

  const totalSubmissions = submissions.length;
  const correctSubmissions = submissions.filter(s => s.is_correct).length;
  const uniqueExercises = new Set(submissions.map(s => s.exercise_id)).size;
  const uniqueLessons = new Set(submissions.map(s => s.lesson_id)).size;

  // First attempt success rate
  const firstAttempts = submissions.filter(s => s.attempt_number === 1);
  const firstAttemptCorrect = firstAttempts.filter(s => s.is_correct).length;

  // Average time spent (only for submissions with time data)
  const submissionsWithTime = submissions.filter(s => s.time_spent_seconds !== null);
  const avgTimeSpent = submissionsWithTime.length > 0
    ? Math.round(submissionsWithTime.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / submissionsWithTime.length)
    : 0;

  return {
    total_submissions: totalSubmissions,
    correct_submissions: correctSubmissions,
    overall_success_rate: totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0,
    unique_exercises_attempted: uniqueExercises,
    unique_lessons_attempted: uniqueLessons,
    first_attempt_success_rate: firstAttempts.length > 0 ? Math.round((firstAttemptCorrect / firstAttempts.length) * 100) : 0,
    average_time_spent_seconds: avgTimeSpent,
  };
};
