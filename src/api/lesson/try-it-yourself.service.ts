import { AppDataSource } from '../../config/data-source';
import { TryItYourself } from './try-it-yourself.entity';
import { Lesson } from './lesson.entity';
import { Language } from '../problem/language.entity';
import { NotFoundError, BadRequestError } from '../../utils/apiResponse';
import { executeInDocker, ExecutionResult, LANGUAGE_CONFIGS } from '../submission/services/docker-runner.service';

const tryItYourselfRepository = AppDataSource.getRepository(TryItYourself);
const lessonRepository = AppDataSource.getRepository(Lesson);
const languageRepository = AppDataSource.getRepository(Language);

// ==========================================
// INTERFACES
// ==========================================

export interface CreateTryItYourselfDTO {
  lesson_id: number;
  language_code: string;
  example_code: string;
}

export interface UpdateTryItYourselfDTO {
  language_code?: string;
  example_code?: string;
}

export interface RunCodeDTO {
  source_code: string;
  input?: string;
}

export interface RunCodeResult {
  success: boolean;
  output: string;
  error?: string;
  execution_time: number;
  status: string;
}

// ==========================================
// SERVICE FUNCTIONS
// ==========================================

/**
 * Get Try It Yourself by lesson ID
 */
export const getTryItYourselfByLessonId = async (lessonId: number): Promise<TryItYourself | null> => {
  const tryItYourself = await tryItYourselfRepository.findOne({
    where: { lesson_id: lessonId },
    relations: ['language'],
  });

  return tryItYourself;
};

/**
 * Get Try It Yourself by ID
 */
export const getTryItYourselfById = async (id: number): Promise<TryItYourself> => {
  const tryItYourself = await tryItYourselfRepository.findOne({
    where: { try_it_yourself_id: id },
    relations: ['language', 'lesson'],
  });

  if (!tryItYourself) {
    throw new NotFoundError('Try It Yourself not found');
  }

  return tryItYourself;
};

/**
 * Create Try It Yourself for a lesson
 */
export const createTryItYourself = async (data: CreateTryItYourselfDTO): Promise<TryItYourself> => {
  // Check if lesson exists
  const lesson = await lessonRepository.findOneBy({ lesson_id: data.lesson_id });
  if (!lesson) {
    throw new NotFoundError('Lesson not found');
  }

  // Check if lesson already has Try It Yourself
  const existingTryIt = await tryItYourselfRepository.findOneBy({ lesson_id: data.lesson_id });
  if (existingTryIt) {
    throw new BadRequestError('This lesson already has a Try It Yourself. Please update it instead.');
  }

  // Validate language
  const language = await languageRepository.findOne({
    where: { code: data.language_code, is_active: true },
  });
  if (!language) {
    throw new BadRequestError(`Language '${data.language_code}' is not supported or not active`);
  }

  // Create Try It Yourself
  const tryItYourself = tryItYourselfRepository.create({
    lesson_id: data.lesson_id,
    language_id: language.language_id,
    example_code: data.example_code,
  });

  return await tryItYourselfRepository.save(tryItYourself);
};

/**
 * Update Try It Yourself
 */
export const updateTryItYourself = async (
  lessonId: number, 
  data: UpdateTryItYourselfDTO
): Promise<TryItYourself> => {
  const tryItYourself = await tryItYourselfRepository.findOneBy({ lesson_id: lessonId });
  if (!tryItYourself) {
    throw new NotFoundError('Try It Yourself not found for this lesson');
  }

  // If language_code is provided, validate and update
  if (data.language_code) {
    const language = await languageRepository.findOne({
      where: { code: data.language_code, is_active: true },
    });
    if (!language) {
      throw new BadRequestError(`Language '${data.language_code}' is not supported or not active`);
    }
    tryItYourself.language_id = language.language_id;
  }

  // Update example_code if provided
  if (data.example_code !== undefined) {
    tryItYourself.example_code = data.example_code;
  }

  return await tryItYourselfRepository.save(tryItYourself);
};

/**
 * Delete Try It Yourself
 */
export const deleteTryItYourself = async (lessonId: number): Promise<void> => {
  const result = await tryItYourselfRepository.delete({ lesson_id: lessonId });
  if (result.affected === 0) {
    throw new NotFoundError('Try It Yourself not found for this lesson');
  }
};

/**
 * Get all supported languages for Try It Yourself
 */
export const getSupportedLanguages = async (): Promise<Language[]> => {
  return await languageRepository.find({
    where: { is_active: true },
    select: ['language_id', 'name', 'code', 'version'],
    order: { name: 'ASC' },
  });
};

/**
 * Run code in Try It Yourself
 * Executes user code and returns the output
 */
export const runCode = async (
  lessonId: number, 
  data: RunCodeDTO
): Promise<RunCodeResult> => {
  // Get Try It Yourself with language info
  const tryItYourself = await tryItYourselfRepository.findOne({
    where: { lesson_id: lessonId },
    relations: ['language'],
  });

  if (!tryItYourself) {
    throw new NotFoundError('Try It Yourself not found for this lesson');
  }

  const language = tryItYourself.language;

  // Validate source code
  if (!data.source_code || data.source_code.trim().length === 0) {
    throw new BadRequestError('Source code cannot be empty');
  }

  // Check if language is supported in docker runner
  const langConfig = LANGUAGE_CONFIGS[language.code];
  if (!langConfig) {
    throw new BadRequestError(`Language '${language.code}' is not supported for execution`);
  }

  // Execute code in Docker
  const executionResult: ExecutionResult = await executeInDocker({
    language: language.code,
    sourceCode: data.source_code,
    input: data.input || '',
    timeLimit: 5000, // 5 seconds for Try It Yourself
    memoryLimit: 256, // 256MB for Try It Yourself
    dockerImage: langConfig.dockerImage,
    compileCommand: langConfig.compileCommand,
    runCommand: langConfig.runCommand,
    fileExtension: langConfig.fileExtension,
  });

  // Format the result
  let output = executionResult.stdout;
  let error: string | undefined = undefined;

  if (executionResult.status === 'compile_error') {
    error = executionResult.compilationOutput || executionResult.stderr;
    output = '';
  } else if (executionResult.status === 'runtime_error') {
    error = executionResult.stderr || 'Runtime error occurred';
  } else if (executionResult.status === 'timeout') {
    error = 'Time Limit Exceeded (5 seconds)';
  } else if (executionResult.status === 'memory_limit') {
    error = 'Memory Limit Exceeded (256MB)';
  } else if (executionResult.stderr && executionResult.stderr.trim()) {
    // Include stderr in output for debugging (e.g., Python prints errors to stderr)
    if (output) {
      output = output + '\n--- stderr ---\n' + executionResult.stderr;
    } else {
      output = executionResult.stderr;
    }
  }

  return {
    success: executionResult.status === 'success',
    output,
    error,
    execution_time: executionResult.executionTime,
    status: executionResult.status,
  };
};

/**
 * Run code directly with language code (without lesson)
 * For testing or playground functionality
 */
export const runCodeDirect = async (
  languageCode: string,
  sourceCode: string,
  input?: string
): Promise<RunCodeResult> => {
  // Validate language
  const language = await languageRepository.findOne({
    where: { code: languageCode, is_active: true },
  });

  if (!language) {
    throw new BadRequestError(`Language '${languageCode}' is not supported or not active`);
  }

  // Validate source code
  if (!sourceCode || sourceCode.trim().length === 0) {
    throw new BadRequestError('Source code cannot be empty');
  }

  // Check if language is supported in docker runner
  const langConfig = LANGUAGE_CONFIGS[languageCode];
  if (!langConfig) {
    throw new BadRequestError(`Language '${languageCode}' is not supported for execution`);
  }

  // Execute code in Docker
  const executionResult: ExecutionResult = await executeInDocker({
    language: languageCode,
    sourceCode,
    input: input || '',
    timeLimit: 5000, // 5 seconds
    memoryLimit: 256, // 256MB
    dockerImage: langConfig.dockerImage,
    compileCommand: langConfig.compileCommand,
    runCommand: langConfig.runCommand,
    fileExtension: langConfig.fileExtension,
  });

  // Format the result
  let output = executionResult.stdout;
  let error: string | undefined = undefined;

  if (executionResult.status === 'compile_error') {
    error = executionResult.compilationOutput || executionResult.stderr;
    output = '';
  } else if (executionResult.status === 'runtime_error') {
    error = executionResult.stderr || 'Runtime error occurred';
  } else if (executionResult.status === 'timeout') {
    error = 'Time Limit Exceeded (5 seconds)';
  } else if (executionResult.status === 'memory_limit') {
    error = 'Memory Limit Exceeded (256MB)';
  } else if (executionResult.stderr && executionResult.stderr.trim()) {
    if (output) {
      output = output + '\n--- stderr ---\n' + executionResult.stderr;
    } else {
      output = executionResult.stderr;
    }
  }

  return {
    success: executionResult.status === 'success',
    output,
    error,
    execution_time: executionResult.executionTime,
    status: executionResult.status,
  };
};
