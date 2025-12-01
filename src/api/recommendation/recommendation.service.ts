import { AppDataSource } from '../../config/data-source';
import { UserRecommendation, RecommendationType } from './recommendation.entity';
import { Tag } from '../tag/tag.entity';
import { Problem, ProblemDifficulty } from '../problem/problem.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Submission, SubmissionStatus } from '../submission/submission.entity';
import { callLLM } from '../../services/llm.service';
import { NotFoundError } from '../../utils/apiResponse';
import { In } from 'typeorm';

const recommendationRepository = AppDataSource.getRepository(UserRecommendation);
const tagRepository = AppDataSource.getRepository(Tag);
const problemRepository = AppDataSource.getRepository(Problem);
const lessonRepository = AppDataSource.getRepository(Lesson);
const submissionRepository = AppDataSource.getRepository(Submission);

// ==========================================
// INTERFACES
// ==========================================

export interface RecommendationFilters {
  user_id: number;
  type?: RecommendationType;
  page?: number;
  limit?: number;
}

export interface RecommendationWithItem extends UserRecommendation {
  problem?: Problem;
  lesson?: Lesson;
}

interface AIRecommendationResult {
  problems: { id: number; reason: string }[];
  lessons: { id: number; reason: string }[];
  analysis: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get difficulty order value for comparison
 */
function getDifficultyOrder(difficulty: ProblemDifficulty): number {
  switch (difficulty) {
    case ProblemDifficulty.EASY:
      return 1;
    case ProblemDifficulty.MEDIUM:
      return 2;
    case ProblemDifficulty.HARD:
      return 3;
    default:
      return 1;
  }
}

/**
 * Extract relevant code context based on source code length
 */
function extractCodeContext(sourceCode: string, errorOutput: string): string {
  if (sourceCode.length <= 3000) {
    return sourceCode;
  }

  const lines = sourceCode.split('\n');
  
  // Try to find error line from error output
  const lineMatch = errorOutput.match(/line\s+(\d+)/i) || 
                    errorOutput.match(/:(\d+):/);
  
  if (lineMatch) {
    const errorLine = parseInt(lineMatch[1], 10);
    const contextRadius = 10;
    const startLine = Math.max(0, errorLine - contextRadius - 1);
    const endLine = Math.min(lines.length, errorLine + contextRadius);
    
    const contextLines = lines.slice(startLine, endLine);
    return `// ... (showing lines ${startLine + 1}-${endLine} around error at line ${errorLine})\n` +
           contextLines.join('\n');
  }
  
  // Fallback: top 50 + bottom 50 lines
  const topLines = lines.slice(0, 50);
  const bottomLines = lines.slice(-50);
  
  if (lines.length <= 100) {
    return sourceCode;
  }
  
  return `// ... (showing first 50 and last 50 lines of ${lines.length} total lines)\n` +
         topLines.join('\n') +
         '\n// ... [middle section omitted] ...\n' +
         bottomLines.join('\n');
}

/**
 * Clean JSON response from LLM (remove markdown code blocks if present)
 */
function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  return cleaned.trim();
}

/**
 * Build a compact problem list for LLM prompt
 */
function buildProblemListForPrompt(problems: Problem[], tags: Map<number, string[]>): string {
  return problems.map(p => {
    const problemTags = tags.get(p.problem_id) || [];
    return `[ID:${p.problem_id}] "${p.title}" (${p.difficulty}) - Tags: ${problemTags.join(', ') || 'None'}`;
  }).join('\n');
}

/**
 * Build a compact lesson list for LLM prompt
 */
function buildLessonListForPrompt(lessons: Lesson[]): string {
  return lessons.map(l => 
    `[ID:${l.lesson_id}] "${l.title}" (${l.difficulty_level}) - ${l.description || 'No description'}`
  ).join('\n');
}

// ==========================================
// SMART AI RECOMMENDATION FUNCTION
// ==========================================

/**
 * Use AI to analyze submission and select best recommendations from ALL problems and lessons
 */
async function analyzeSubmissionWithAI(
  submission: Submission,
  allProblems: Problem[],
  allLessons: Lesson[],
  problemTagsMap: Map<number, string[]>,
  solvedProblemIds: number[]
): Promise<AIRecommendationResult> {
  const errorOutput = submission.error_message || submission.stderr || '';
  const codeContext = extractCodeContext(submission.source_code, errorOutput);
  
  // Filter out solved problems and current problem for recommendation candidates
  const candidateProblems = allProblems.filter(
    p => p.problem_id !== submission.problem_id && !solvedProblemIds.includes(p.problem_id)
  );

  const problemListStr = buildProblemListForPrompt(candidateProblems, problemTagsMap);
  const lessonListStr = buildLessonListForPrompt(allLessons);

  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    {
      role: 'system',
      content: `You are an intelligent programming tutor AI. Your task is to analyze a student's failed submission and recommend the most suitable problems and lessons to help them improve.

You must:
1. Analyze the error type and code issues
2. Identify what concepts/skills the student is struggling with
3. Select up to 10 most relevant problems (sorted by relevance) that will help them practice
4. Select up to 5 most relevant lessons that explain the concepts they need to learn

Consider:
- Error type (syntax, runtime, wrong answer, TLE, MLE)
- Code patterns and common mistakes
- Difficulty progression (recommend easier problems first if struggling with basics)
- Tag relevance to the identified weakness
- Lesson content that explains the needed concepts

Return ONLY valid JSON without any markdown formatting.`,
    },
    {
      role: 'user',
      content: `## Student's Failed Submission

### Problem Attempted
Title: "${submission.problem.title}"
Difficulty: ${submission.problem.difficulty}

### Submission Status
Status: ${submission.status}

### Error Output
${errorOutput || 'No specific error message'}

### Student's Code
\`\`\`
${codeContext}
\`\`\`

---

## Available Problems for Recommendation
${problemListStr}

---

## Available Lessons for Recommendation
${lessonListStr}

---

## Instructions
Based on your analysis of the student's submission:
1. Identify what the student is struggling with
2. Select the most helpful problems (up to 10) from the list above
3. Select the most helpful lessons (up to 5) from the list above
4. Provide a brief reason for each recommendation

Return JSON in this exact format:
{
  "analysis": "Brief analysis of student's main issues (1-2 sentences)",
  "problems": [
    {"id": <problem_id>, "reason": "Why this problem helps"},
    ...
  ],
  "lessons": [
    {"id": <lesson_id>, "reason": "Why this lesson helps"},
    ...
  ]
}`,
    },
  ];

  try {
    const response = await callLLM(messages);
    
    if (response.provider === 'none') {
      console.warn('[Recommendation] LLM not configured, using fallback logic');
      return getFallbackRecommendations(submission, candidateProblems, allLessons, problemTagsMap);
    }

    const cleanedResponse = cleanJsonResponse(response.answer);
    const parsed = JSON.parse(cleanedResponse) as AIRecommendationResult;
    
    // Validate and filter results
    const validProblemIds = new Set(candidateProblems.map(p => p.problem_id));
    const validLessonIds = new Set(allLessons.map(l => l.lesson_id));
    
    parsed.problems = (parsed.problems || [])
      .filter(p => validProblemIds.has(p.id))
      .slice(0, 10);
    
    parsed.lessons = (parsed.lessons || [])
      .filter(l => validLessonIds.has(l.id))
      .slice(0, 5);

    return parsed;
  } catch (error) {
    console.error('[Recommendation] Error in AI analysis:', error);
    return getFallbackRecommendations(submission, candidateProblems, allLessons, problemTagsMap);
  }
}

/**
 * Fallback recommendation logic when LLM is unavailable
 */
function getFallbackRecommendations(
  submission: Submission,
  candidateProblems: Problem[],
  allLessons: Lesson[],
  problemTagsMap: Map<number, string[]>
): AIRecommendationResult {
  const errorOutput = (submission.error_message || submission.stderr || '').toLowerCase();
  const currentDifficulty = getDifficultyOrder(submission.problem.difficulty);
  
  // Determine weakness based on error
  let targetTags: string[] = [];
  let analysis = 'Based on your submission error';
  
  if (errorOutput.includes('syntax') || errorOutput.includes('parse') || errorOutput.includes('unexpected')) {
    targetTags = ['syntax-basic', 'debugging'];
    analysis = 'You seem to have syntax errors. Practice basic syntax and debugging.';
  } else if (errorOutput.includes('time limit') || errorOutput.includes('tle') || errorOutput.includes('timeout')) {
    targetTags = ['time-complexity', 'dynamic-programming', 'binary-search'];
    analysis = 'Your solution is too slow. Learn about algorithm optimization and time complexity.';
  } else if (errorOutput.includes('memory limit') || errorOutput.includes('mle') || errorOutput.includes('segmentation')) {
    targetTags = ['memory-management', 'array', 'linked-list'];
    analysis = 'Memory issues detected. Practice memory management and data structures.';
  } else if (errorOutput.includes('wrong answer') || errorOutput.includes('wa')) {
    targetTags = ['logic-edge-cases', 'debugging', 'math'];
    analysis = 'Your logic may have edge case issues. Practice problem-solving and edge case handling.';
  } else {
    targetTags = ['debugging', 'syntax-basic', 'logic-edge-cases'];
    analysis = 'General programming practice recommended.';
  }

  // Score and sort problems
  const scoredProblems = candidateProblems.map(p => {
    const tags = problemTagsMap.get(p.problem_id) || [];
    let score = 0;
    
    // Tag match score
    for (const tag of tags) {
      if (targetTags.some(t => tag.toLowerCase().includes(t.replace('-', ' ')) || t.includes(tag.toLowerCase()))) {
        score += 10;
      }
    }
    
    // Difficulty score (prefer same or easier)
    const diffOrder = getDifficultyOrder(p.difficulty);
    if (diffOrder <= currentDifficulty) {
      score += 5;
    }
    if (diffOrder === currentDifficulty) {
      score += 3;
    }
    
    return { problem: p, score };
  });

  scoredProblems.sort((a, b) => b.score - a.score);
  
  const recommendedProblems = scoredProblems.slice(0, 10).map(sp => ({
    id: sp.problem.problem_id,
    reason: `Recommended to practice ${(problemTagsMap.get(sp.problem.problem_id) || ['programming']).slice(0, 2).join(', ')}`
  }));

  // Select beginner/intermediate lessons
  const recommendedLessons = allLessons
    .filter(l => l.difficulty_level === 'BEGINNER' || l.difficulty_level === 'INTERMEDIATE')
    .slice(0, 5)
    .map(l => ({
      id: l.lesson_id,
      reason: `Learn ${l.title} to strengthen fundamentals`
    }));

  return {
    analysis,
    problems: recommendedProblems,
    lessons: recommendedLessons
  };
}

// ==========================================
// RECOMMENDATION UPDATE LOGIC
// ==========================================

/**
 * Update recommendations for a user based on a submission
 * This is called after a submission is judged
 * Uses AI to analyze submission and select from ALL problems and lessons
 */
export async function updateRecommendations(
  userId: number,
  submissionId: number
): Promise<void> {
  // Fetch submission with problem
  const submission = await submissionRepository.findOne({
    where: { submission_id: submissionId },
    relations: ['problem'],
  });

  if (!submission) {
    throw new NotFoundError(`Submission ${submissionId} not found`);
  }

  // Don't generate recommendations for accepted submissions
  if (submission.status === SubmissionStatus.ACCEPTED) {
    return;
  }

  // Fetch ALL published problems with their tags
  const allProblems = await problemRepository
    .createQueryBuilder('problem')
    .leftJoinAndSelect('problem.tags', 'tag')
    .where('problem.is_published = :isPublished', { isPublished: true })
    .getMany();

  // Build problem -> tags map
  const problemTagsMap = new Map<number, string[]>();
  for (const problem of allProblems) {
    problemTagsMap.set(
      problem.problem_id,
      (problem.tags || []).map(t => t.name)
    );
  }

  // Fetch ALL published lessons
  const allLessons = await lessonRepository.find({
    where: { is_published: true },
    select: ['lesson_id', 'title', 'description', 'difficulty_level', 'category_id'],
  });

  // Get user's solved problems
  const solvedSubmissions = await submissionRepository.find({
    where: {
      user_id: userId,
      status: SubmissionStatus.ACCEPTED,
    },
    select: ['problem_id'],
  });
  const solvedProblemIds = [...new Set(solvedSubmissions.map((s) => s.problem_id))];

  // Use AI to analyze and get recommendations
  const aiResult = await analyzeSubmissionWithAI(
    submission,
    allProblems,
    allLessons,
    problemTagsMap,
    solvedProblemIds
  );

  if (aiResult.problems.length === 0 && aiResult.lessons.length === 0) {
    console.log('[Recommendation] No recommendations generated');
    return;
  }

  // Transaction: Delete old recommendations and insert new ones
  await AppDataSource.transaction(async (manager) => {
    // Delete old recommendations for this user
    await manager.delete(UserRecommendation, { user_id: userId });

    const newRecommendations: UserRecommendation[] = [];

    // Add problem recommendations
    for (const prob of aiResult.problems) {
      const recommendation = new UserRecommendation();
      recommendation.user_id = userId;
      recommendation.type = RecommendationType.PROBLEM;
      recommendation.item_id = prob.id;
      recommendation.reason = prob.reason || aiResult.analysis;
      newRecommendations.push(recommendation);
    }

    // Add lesson recommendations
    for (const lesson of aiResult.lessons) {
      const recommendation = new UserRecommendation();
      recommendation.user_id = userId;
      recommendation.type = RecommendationType.LESSON;
      recommendation.item_id = lesson.id;
      recommendation.reason = lesson.reason || aiResult.analysis;
      newRecommendations.push(recommendation);
    }

    if (newRecommendations.length > 0) {
      await manager.save(UserRecommendation, newRecommendations);
    }
  });

  console.log(`[Recommendation] Generated ${aiResult.problems.length} problem and ${aiResult.lessons.length} lesson recommendations for user ${userId}`);
}

// ==========================================
// LEGACY TAG ANALYSIS (kept for other uses)
// ==========================================

/**
 * Analyze error output and source code to determine relevant concept tags
 * Uses LLM to identify 1-3 relevant tags based on the error pattern
 */
export async function analyzeErrorAndGetTags(
  problemTitle: string,
  errorOutput: string,
  sourceCode: string
): Promise<number[]> {
  const allTags = await tagRepository.find({
    where: { is_active: true },
    select: ['tag_id', 'name', 'slug', 'description'],
  });

  if (allTags.length === 0) {
    console.warn('[Recommendation] No tags found in database');
    return [];
  }

  const codeContext = extractCodeContext(sourceCode, errorOutput);

  const tagListStr = allTags
    .map((tag) => `- ID: ${tag.tag_id}, Name: "${tag.name}", Description: "${tag.description || 'N/A'}"`)
    .join('\n');

  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    {
      role: 'system',
      content: `You are a code diagnosis tool. Your task is to analyze programming errors and identify relevant concept tags. Return ONLY valid JSON without any markdown formatting or explanation.`,
    },
    {
      role: 'user',
      content: `Analyze the following submission error and identify 1-3 relevant concept tags.

## Problem Title
${problemTitle}

## Error Output
${errorOutput || 'No error output available'}

## Source Code (Context)
\`\`\`
${codeContext}
\`\`\`

## Available Tags
${tagListStr}

## Instructions
Based on the error type and code patterns, select 1 to 3 tag IDs that best describe the concept(s) the student needs to practice.

Return ONLY a JSON object in this format (no markdown, no explanation):
{"tag_ids": [1, 2, 3]}`,
    },
  ];

  try {
    const response = await callLLM(messages);
    
    if (response.provider === 'none') {
      return getFallbackTags(errorOutput, allTags);
    }

    const cleanedResponse = cleanJsonResponse(response.answer);
    const parsed = JSON.parse(cleanedResponse);
    
    if (!parsed.tag_ids || !Array.isArray(parsed.tag_ids)) {
      return getFallbackTags(errorOutput, allTags);
    }

    const validTagIds = allTags.map((t) => t.tag_id);
    const filteredTags = parsed.tag_ids
      .filter((id: number) => validTagIds.includes(id))
      .slice(0, 3);

    return filteredTags;
  } catch (error) {
    console.error('[Recommendation] Error analyzing error:', error);
    return getFallbackTags(errorOutput, allTags);
  }
}

/**
 * Fallback tag selection based on error patterns when LLM is unavailable
 */
function getFallbackTags(errorOutput: string, allTags: Tag[]): number[] {
  const errorLower = errorOutput.toLowerCase();
  const result: number[] = [];

  const tagMap = new Map(allTags.map((t) => [t.slug, t.tag_id]));

  if (errorLower.includes('syntax') || errorLower.includes('parse') || errorLower.includes('unexpected')) {
    const syntaxTag = tagMap.get('syntax-basic');
    if (syntaxTag) result.push(syntaxTag);
  }

  if (errorLower.includes('time limit') || errorLower.includes('tle') || errorLower.includes('timeout')) {
    const timeTag = tagMap.get('time-complexity');
    if (timeTag) result.push(timeTag);
  }

  if (errorLower.includes('memory limit') || errorLower.includes('mle') || errorLower.includes('segmentation')) {
    const memTag = tagMap.get('memory-management');
    if (memTag) result.push(memTag);
  }

  if (errorLower.includes('wrong answer') || errorLower.includes('wa') || errorLower.includes('runtime')) {
    const logicTag = tagMap.get('logic-edge-cases');
    if (logicTag) result.push(logicTag);
  }

  if (result.length === 0) {
    const debugTag = tagMap.get('debugging');
    if (debugTag) result.push(debugTag);
  }

  return result.slice(0, 3);
}

// ==========================================
// GET RECOMMENDATIONS
// ==========================================

/**
 * Get recommendations for a user
 */
export async function getRecommendations(
  filters: RecommendationFilters
): Promise<{ recommendations: RecommendationWithItem[]; total: number }> {
  const { user_id, type, page = 1, limit = 10 } = filters;

  const whereCondition: any = { user_id };
  if (type) {
    whereCondition.type = type;
  }

  const [recommendations, total] = await recommendationRepository.findAndCount({
    where: whereCondition,
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Populate items based on type
  const result: RecommendationWithItem[] = [];

  for (const rec of recommendations) {
    const enrichedRec: RecommendationWithItem = { ...rec };

    if (rec.type === RecommendationType.PROBLEM) {
      const problem = await problemRepository.findOne({
        where: { problem_id: rec.item_id },
        select: ['problem_id', 'title', 'difficulty', 'points', 'acceptance_rate'],
      });
      enrichedRec.problem = problem || undefined;
    } else if (rec.type === RecommendationType.LESSON) {
      const lesson = await lessonRepository.findOne({
        where: { lesson_id: rec.item_id },
        select: ['lesson_id', 'title', 'description', 'difficulty_level', 'category_id'],
      });
      enrichedRec.lesson = lesson || undefined;
    }

    result.push(enrichedRec);
  }

  return { recommendations: result, total };
}

/**
 * Get random easy problems for cold start (new users with no recommendations)
 */
export async function getRandomEasyProblems(
  userId: number,
  count: number = 10
): Promise<Problem[]> {
  const solvedSubmissions = await submissionRepository.find({
    where: {
      user_id: userId,
      status: SubmissionStatus.ACCEPTED,
    },
    select: ['problem_id'],
  });
  const solvedProblemIds = [...new Set(solvedSubmissions.map((s) => s.problem_id))];

  const queryBuilder = problemRepository
    .createQueryBuilder('problem')
    .where('problem.difficulty = :difficulty', { difficulty: ProblemDifficulty.EASY })
    .andWhere('problem.is_published = :isPublished', { isPublished: true });

  if (solvedProblemIds.length > 0) {
    queryBuilder.andWhere('problem.problem_id NOT IN (:...solvedIds)', { solvedIds: solvedProblemIds });
  }

  queryBuilder.orderBy('RAND()').take(count);

  const problems = await queryBuilder.getMany();
  return problems;
}

/**
 * Get random beginner lessons for cold start (new users with no recommendations)
 */
export async function getRandomBeginnerLessons(
  count: number = 10
): Promise<Lesson[]> {
  const lessons = await lessonRepository
    .createQueryBuilder('lesson')
    .where('lesson.difficulty_level = :difficulty', { difficulty: 'BEGINNER' })
    .andWhere('lesson.is_published = :isPublished', { isPublished: true })
    .orderBy('RAND()')
    .take(count)
    .getMany();

  return lessons;
}

/**
 * Delete all recommendations for a user
 */
export async function clearUserRecommendations(userId: number): Promise<void> {
  await recommendationRepository.delete({ user_id: userId });
}
