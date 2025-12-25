import { AppDataSource } from '../../config/data-source';
import { Problem, ProblemDifficulty, SampleIO } from './problem.entity';
import { TestCase } from './testcase.entity';
import { Language } from './language.entity';
import { Tag } from '../tag/tag.entity';
import { BadRequestError, NotFoundError } from '../../utils/apiResponse';
import { In } from 'typeorm';
import { getFormattedDate } from '../../utils/date.utils';

const problemRepository = AppDataSource.getRepository(Problem);
const testCaseRepository = AppDataSource.getRepository(TestCase);
const languageRepository = AppDataSource.getRepository(Language);
const tagRepository = AppDataSource.getRepository(Tag);

// ==========================================
// INTERFACES
// ==========================================

export interface CreateProblemDTO {
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  tag_ids?: number[];
  time_limit?: number;
  memory_limit?: number;
  points?: number;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  samples?: SampleIO[];
  author_notes?: string;
  is_published?: boolean;
  created_by: number;
}

export interface UpdateProblemDTO {
  title?: string;
  description?: string;
  difficulty?: ProblemDifficulty;
  tag_ids?: number[];
  time_limit?: number;
  memory_limit?: number;
  points?: number;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  samples?: SampleIO[];
  author_notes?: string;
  is_published?: boolean;
}

export interface CreateTestCaseDTO {
  input_data: string;
  expected_output: string;
  is_sample?: boolean;
  is_hidden?: boolean;
  explanation?: string;
  score?: number;
}

export interface ProblemFilters {
  difficulty?: ProblemDifficulty;
  tag_id?: number;
  tag_slug?: string;
  is_published?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// PROBLEM SERVICE FUNCTIONS
// ==========================================

/**
 * Create a new problem
 */
export const createProblem = async (data: CreateProblemDTO): Promise<Problem> => {
  // Validate required fields
  if (!data.title || !data.description || !data.difficulty || !data.created_by) {
    throw new BadRequestError('Missing required fields: title, description, difficulty, created_by');
  }

  // Validate difficulty enum
  if (!Object.values(ProblemDifficulty).includes(data.difficulty)) {
    throw new BadRequestError(`Invalid difficulty. Must be one of: ${Object.values(ProblemDifficulty).join(', ')}`);
  }

  // Validate and fetch tags if provided
  let tags: Tag[] = [];
  if (data.tag_ids && data.tag_ids.length > 0) {
    tags = await tagRepository.find({
      where: { tag_id: In(data.tag_ids), is_active: true },
    });
    
    if (tags.length !== data.tag_ids.length) {
      const foundIds = tags.map(t => t.tag_id);
      const missingIds = data.tag_ids.filter(id => !foundIds.includes(id));
      throw new BadRequestError(`Tags not found or inactive: ${missingIds.join(', ')}`);
    }
  }

  // Create problem entity
  const problem = problemRepository.create({
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    time_limit: data.time_limit || 1000,
    memory_limit: data.memory_limit || 256,
    points: data.points || 100,
    input_format: data.input_format || null,
    output_format: data.output_format || null,
    constraints: data.constraints || null,
    samples: data.samples || null,
    author_notes: data.author_notes || null,
    is_published: data.is_published || false,
    created_by: data.created_by,
    tags: tags, // Assign tags to problem
  });

  const savedProblem = await problemRepository.save(problem);

  // Update problem_count for each tag
  for (const tag of tags) {
    await tagRepository.increment({ tag_id: tag.tag_id }, 'problem_count', 1);
  }

  return savedProblem;
};

/**
 * Get problem by ID with optional relations
 */
export const getProblemById = async (
  problemId: number,
  includeTestCases: boolean = false,
  includeHiddenTestCases: boolean = false
): Promise<Problem> => {
  const queryBuilder = problemRepository
    .createQueryBuilder('problem')
    .leftJoinAndSelect('problem.author', 'author')
    .leftJoinAndSelect('problem.tags', 'tags')
    .where('problem.problem_id = :problemId', { problemId });

  if (includeTestCases) {
    if (includeHiddenTestCases) {
      queryBuilder.leftJoinAndSelect('problem.test_cases', 'test_cases');
    } else {
      queryBuilder.leftJoinAndSelect(
        'problem.test_cases',
        'test_cases',
        'test_cases.is_hidden = :isHidden',
        { isHidden: false }
      );
    }
  }

  const problem = await queryBuilder.getOne();

  if (!problem) {
    throw new NotFoundError('Problem not found');
  }

  return problem;
};

/**
 * Get all problems with filters and pagination
 */
export const getProblems = async (filters: ProblemFilters): Promise<{ problems: Problem[]; total: number }> => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const queryBuilder = problemRepository
    .createQueryBuilder('problem')
    .leftJoinAndSelect('problem.author', 'author')
    .leftJoinAndSelect('problem.tags', 'tags')
    .select([
      'problem.problem_id',
      'problem.title',
      'problem.difficulty',
      'problem.points',
      'problem.acceptance_rate',
      'problem.total_submissions',
      'problem.accepted_submissions',
      'problem.is_published',
      'problem.created_at',
      'author.user_id',
      'author.full_name',
      'tags.tag_id',
      'tags.name',
      'tags.slug',
      'tags.color',
    ]);

  // Apply filters
  if (filters.difficulty) {
    queryBuilder.andWhere('problem.difficulty = :difficulty', { difficulty: filters.difficulty });
  }

  // Filter by tag ID
  if (filters.tag_id) {
    queryBuilder.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('pt.problem_id')
        .from('problem_tags', 'pt')
        .where('pt.tag_id = :tagId')
        .getQuery();
      return `problem.problem_id IN ${subQuery}`;
    }).setParameter('tagId', filters.tag_id);
  }

  // Filter by tag slug
  if (filters.tag_slug) {
    queryBuilder.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('pt.problem_id')
        .from('problem_tags', 'pt')
        .innerJoin('tags', 't', 't.tag_id = pt.tag_id')
        .where('t.slug = :tagSlug')
        .getQuery();
      return `problem.problem_id IN ${subQuery}`;
    }).setParameter('tagSlug', filters.tag_slug);
  }

  if (filters.is_published !== undefined) {
    queryBuilder.andWhere('problem.is_published = :is_published', { is_published: filters.is_published });
  }

  if (filters.search) {
    queryBuilder.andWhere('(problem.title LIKE :search OR problem.description LIKE :search)', {
      search: `%${filters.search}%`,
    });
  }

  // Get total count
  const total = await queryBuilder.getCount();

  // Apply pagination
  const problems = await queryBuilder
    .orderBy('problem.created_at', 'DESC')
    .skip(skip)
    .take(limit)
    .getMany();

  return { problems, total };
};

/**
 * Update a problem
 */
export const updateProblem = async (problemId: number, data: UpdateProblemDTO): Promise<Problem> => {
  const problem = await getProblemById(problemId, false, false);

  // Handle tags update if provided
  if (data.tag_ids !== undefined) {
    // Get old tags for updating problem_count
    const oldTags = problem.tags || [];
    const oldTagIds = oldTags.map(t => t.tag_id);

    if (data.tag_ids.length > 0) {
      const newTags = await tagRepository.find({
        where: { tag_id: In(data.tag_ids), is_active: true },
      });
      
      if (newTags.length !== data.tag_ids.length) {
        const foundIds = newTags.map(t => t.tag_id);
        const missingIds = data.tag_ids.filter(id => !foundIds.includes(id));
        throw new BadRequestError(`Tags not found or inactive: ${missingIds.join(', ')}`);
      }
      
      problem.tags = newTags;

      // Update problem_count for removed tags (decrement)
      const removedTagIds = oldTagIds.filter(id => !data.tag_ids!.includes(id));
      for (const tagId of removedTagIds) {
        await tagRepository.decrement({ tag_id: tagId }, 'problem_count', 1);
      }

      // Update problem_count for added tags (increment)
      const addedTagIds = data.tag_ids.filter(id => !oldTagIds.includes(id));
      for (const tagId of addedTagIds) {
        await tagRepository.increment({ tag_id: tagId }, 'problem_count', 1);
      }
    } else {
      problem.tags = [];
      // Decrement all old tags
      for (const tagId of oldTagIds) {
        await tagRepository.decrement({ tag_id: tagId }, 'problem_count', 1);
      }
    }

    // Remove tag_ids from data to avoid overwriting
    delete (data as any).tag_ids;
  }

  // Update other fields
  Object.assign(problem, {
    ...data,
    updated_at: new Date(),
  });

  return await problemRepository.save(problem);
};

/**
 * Delete a problem
 */
export const deleteProblem = async (problemId: number): Promise<void> => {
  const problem = await getProblemById(problemId);
  await problemRepository.remove(problem);
};

/**
 * Update problem statistics after a submission
 */
export const updateProblemStats = async (
  problemId: number,
  isAccepted: boolean
): Promise<void> => {
  await problemRepository
    .createQueryBuilder()
    .update(Problem)
    .set({
      total_submissions: () => 'total_submissions + 1',
      accepted_submissions: isAccepted ? () => 'accepted_submissions + 1' : undefined,
    })
    .where('problem_id = :problemId', { problemId })
    .execute();

  // Update acceptance rate
  await problemRepository
    .createQueryBuilder()
    .update(Problem)
    .set({
      acceptance_rate: () => 'ROUND((accepted_submissions / total_submissions) * 100, 2)',
    })
    .where('problem_id = :problemId', { problemId })
    .execute();
};

// ==========================================
// TEST CASE SERVICE FUNCTIONS
// ==========================================

/**
 * Add a test case to a problem
 */
export const addTestCase = async (
  problemId: number,
  data: CreateTestCaseDTO
): Promise<TestCase> => {
  // Verify problem exists
  await getProblemById(problemId);

  // Validate required fields
  if (!data.input_data || !data.expected_output) {
    throw new BadRequestError('Missing required fields: input_data, expected_output');
  }

  const testCase = testCaseRepository.create({
    problem_id: problemId,
    input_data: data.input_data,
    expected_output: data.expected_output,
    is_sample: data.is_sample || false,
    is_hidden: data.is_hidden !== undefined ? data.is_hidden : true,
    explanation: data.explanation || null,
    score: data.score || 1,
  });

  return await testCaseRepository.save(testCase);
};

/**
 * Add multiple test cases at once
 */
export const addBulkTestCases = async (
  problemId: number,
  testCases: CreateTestCaseDTO[]
): Promise<TestCase[]> => {
  // Verify problem exists
  await getProblemById(problemId);

  const createdTestCases = testCases.map((tc) =>
    testCaseRepository.create({
      problem_id: problemId,
      input_data: tc.input_data,
      expected_output: tc.expected_output,
      is_sample: tc.is_sample || false,
      is_hidden: tc.is_hidden !== undefined ? tc.is_hidden : true,
      explanation: tc.explanation || null,
      score: tc.score || 1,
    })
  );

  return await testCaseRepository.save(createdTestCases);
};

/**
 * Get all test cases for a problem
 */
export const getTestCases = async (
  problemId: number,
  includeHidden: boolean = false
): Promise<TestCase[]> => {
  const queryBuilder = testCaseRepository
    .createQueryBuilder('test_case')
    .where('test_case.problem_id = :problemId', { problemId });

  if (!includeHidden) {
    queryBuilder.andWhere('test_case.is_hidden = :isHidden', { isHidden: false });
  }

  return await queryBuilder.orderBy('test_case.test_case_id', 'ASC').getMany();
};

/**
 * Get a test case by ID
 */
export const getTestCaseById = async (testCaseId: number): Promise<TestCase> => {
  const testCase = await testCaseRepository.findOne({
    where: { test_case_id: testCaseId },
    relations: ['problem'],
  });

  if (!testCase) {
    throw new NotFoundError('Test case not found');
  }

  return testCase;
};

/**
 * Update a test case
 */
export const updateTestCase = async (
  testCaseId: number,
  data: Partial<CreateTestCaseDTO>
): Promise<TestCase> => {
  const testCase = await testCaseRepository.findOne({
    where: { test_case_id: testCaseId },
  });

  if (!testCase) {
    throw new NotFoundError('Test case not found');
  }

  Object.assign(testCase, data);
  return await testCaseRepository.save(testCase);
};

/**
 * Delete a test case
 */
export const deleteTestCase = async (testCaseId: number): Promise<void> => {
  const testCase = await testCaseRepository.findOne({
    where: { test_case_id: testCaseId },
  });

  if (!testCase) {
    throw new NotFoundError('Test case not found');
  }

  await testCaseRepository.remove(testCase);
};

/**
 * Get total score for a problem's test cases
 */
export const getTotalScore = async (problemId: number): Promise<number> => {
  const result = await testCaseRepository
    .createQueryBuilder('test_case')
    .select('SUM(test_case.score)', 'total_score')
    .where('test_case.problem_id = :problemId', { problemId })
    .getRawOne();

  return result?.total_score || 0;
};

// ==========================================
// LANGUAGE SERVICE FUNCTIONS
// ==========================================

/**
 * Get all supported languages
 */
export const getLanguages = async (): Promise<Language[]> => {
  return await languageRepository.find({
    where: { is_active: true },
    order: { name: 'ASC' },
  });
};

/**
 * Get language by code
 */
export const getLanguageByCode = async (code: string): Promise<Language> => {
  const language = await languageRepository.findOne({
    where: { code, is_active: true },
  });

  if (!language) {
    throw new NotFoundError(`Language '${code}' not found or not supported`);
  }

  return language;
};

/**
 * Get language by ID
 */
export const getLanguageById = async (languageId: number): Promise<Language> => {
  const language = await languageRepository.findOne({
    where: { language_id: languageId, is_active: true },
  });

  if (!language) {
    throw new NotFoundError('Language not found');
  }

  return language;
};

export const getDailyChallenge = async (): Promise<Problem[]> => {
    // Lấy tất cả daily challenges hiện tại (được quản lý bởi scheduler)
    const problems = await problemRepository.find({
        where: {
            is_daily_challenge: true,
            is_published: true, 
        },
        relations: ['tags', 'author'],
        order: {
            difficulty: 'ASC', // EASY -> MEDIUM -> HARD
        },
    });

    if (!problems || problems.length === 0) {
        throw new NotFoundError('Chưa có Thử thách hàng ngày nào được thiết lập cho hôm nay.');
    }

    return problems;
};