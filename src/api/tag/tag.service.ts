import { AppDataSource } from '../../config/data-source';
import { Tag } from './tag.entity';
import { Problem } from '../problem/problem.entity';
import { BadRequestError, NotFoundError } from '../../utils/apiResponse';
import { Like, In } from 'typeorm';

const tagRepository = AppDataSource.getRepository(Tag);
const problemRepository = AppDataSource.getRepository(Problem);

// ==========================================
// INTERFACES
// ==========================================

export interface CreateTagDTO {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface UpdateTagDTO {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface TagFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Update problem count for a tag
 */
async function updateProblemCount(tagId: number): Promise<void> {
  const count = await problemRepository
    .createQueryBuilder('problem')
    .innerJoin('problem.tags', 'tag')
    .where('tag.tag_id = :tagId', { tagId })
    .andWhere('problem.is_published = :isPublished', { isPublished: true })
    .getCount();

  await tagRepository.update(tagId, { problem_count: count });
}

// ==========================================
// CRUD OPERATIONS
// ==========================================

/**
 * Create a new tag
 */
export async function createTag(data: CreateTagDTO): Promise<Tag> {
  // Generate slug if not provided
  const slug = data.slug || generateSlug(data.name);

  // Check for duplicate name or slug
  const existing = await tagRepository.findOne({
    where: [{ name: data.name }, { slug }],
  });

  if (existing) {
    if (existing.name === data.name) {
      throw new BadRequestError(`Tag with name '${data.name}' already exists`);
    }
    throw new BadRequestError(`Tag with slug '${slug}' already exists`);
  }

  const tag = tagRepository.create({
    name: data.name,
    slug,
    description: data.description,
    color: data.color || '#6366f1', // Default indigo color
    icon: data.icon,
    order_index: data.order_index || 0,
    is_active: data.is_active !== undefined ? data.is_active : true,
    problem_count: 0,
  });

  return await tagRepository.save(tag);
}

/**
 * Get tag by ID
 */
export async function getTagById(tagId: number): Promise<Tag> {
  const tag = await tagRepository.findOne({
    where: { tag_id: tagId },
  });

  if (!tag) {
    throw new NotFoundError('Tag not found');
  }

  return tag;
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string): Promise<Tag> {
  const tag = await tagRepository.findOne({
    where: { slug },
  });

  if (!tag) {
    throw new NotFoundError('Tag not found');
  }

  return tag;
}

/**
 * Get all tags with filters
 */
export async function getTags(filters: TagFilters): Promise<{ tags: Tag[]; total: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const queryBuilder = tagRepository.createQueryBuilder('tag');

  // Filter by search term
  if (filters.search) {
    queryBuilder.andWhere(
      '(tag.name LIKE :search OR tag.slug LIKE :search OR tag.description LIKE :search)',
      { search: `%${filters.search}%` }
    );
  }

  // Filter by active status
  if (filters.is_active !== undefined) {
    queryBuilder.andWhere('tag.is_active = :isActive', { isActive: filters.is_active });
  }

  // Order by order_index, then by name
  queryBuilder.orderBy('tag.order_index', 'ASC').addOrderBy('tag.name', 'ASC');

  const [tags, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

  return { tags, total };
}

/**
 * Get all active tags (for public use)
 */
export async function getActiveTags(): Promise<Tag[]> {
  return await tagRepository.find({
    where: { is_active: true },
    order: { order_index: 'ASC', name: 'ASC' },
  });
}

/**
 * Update a tag
 */
export async function updateTag(tagId: number, data: UpdateTagDTO): Promise<Tag> {
  const tag = await getTagById(tagId);

  // Check for duplicate name or slug if they are being changed
  if (data.name && data.name !== tag.name) {
    const existingName = await tagRepository.findOne({
      where: { name: data.name },
    });
    if (existingName) {
      throw new BadRequestError(`Tag with name '${data.name}' already exists`);
    }
  }

  if (data.slug && data.slug !== tag.slug) {
    const existingSlug = await tagRepository.findOne({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      throw new BadRequestError(`Tag with slug '${data.slug}' already exists`);
    }
  }

  // Update fields
  if (data.name !== undefined) tag.name = data.name;
  if (data.slug !== undefined) tag.slug = data.slug;
  if (data.description !== undefined) tag.description = data.description;
  if (data.color !== undefined) tag.color = data.color;
  if (data.icon !== undefined) tag.icon = data.icon;
  if (data.order_index !== undefined) tag.order_index = data.order_index;
  if (data.is_active !== undefined) tag.is_active = data.is_active;

  return await tagRepository.save(tag);
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: number): Promise<void> {
  const tag = await getTagById(tagId);
  await tagRepository.remove(tag);
}

/**
 * Toggle tag active status (hide/show)
 */
export async function toggleTagStatus(tagId: number): Promise<Tag> {
  const tag = await getTagById(tagId);
  tag.is_active = !tag.is_active;
  return await tagRepository.save(tag);
}

// ==========================================
// PROBLEM-TAG RELATIONS
// ==========================================

/**
 * Add tags to a problem
 */
export async function addTagsToProblem(problemId: number, tagIds: number[]): Promise<Problem> {
  const problem = await problemRepository.findOne({
    where: { problem_id: problemId },
    relations: ['tags'],
  });

  if (!problem) {
    throw new NotFoundError('Problem not found');
  }

  const tags = await tagRepository.find({
    where: { tag_id: In(tagIds), is_active: true },
  });

  if (tags.length !== tagIds.length) {
    throw new BadRequestError('One or more tags not found or inactive');
  }

  // Add new tags (avoid duplicates)
  const existingTagIds = problem.tags?.map((t) => t.tag_id) || [];
  const newTags = tags.filter((t) => !existingTagIds.includes(t.tag_id));
  
  problem.tags = [...(problem.tags || []), ...newTags];
  await problemRepository.save(problem);

  // Update problem count for affected tags
  for (const tag of newTags) {
    await updateProblemCount(tag.tag_id);
  }

  return problem;
}

/**
 * Remove tags from a problem
 */
export async function removeTagsFromProblem(problemId: number, tagIds: number[]): Promise<Problem> {
  const problem = await problemRepository.findOne({
    where: { problem_id: problemId },
    relations: ['tags'],
  });

  if (!problem) {
    throw new NotFoundError('Problem not found');
  }

  const removedTagIds = tagIds.filter((id) => problem.tags?.some((t) => t.tag_id === id));
  problem.tags = problem.tags?.filter((t) => !tagIds.includes(t.tag_id)) || [];
  await problemRepository.save(problem);

  // Update problem count for affected tags
  for (const tagId of removedTagIds) {
    await updateProblemCount(tagId);
  }

  return problem;
}

/**
 * Set tags for a problem (replace all)
 */
export async function setTagsForProblem(problemId: number, tagIds: number[]): Promise<Problem> {
  const problem = await problemRepository.findOne({
    where: { problem_id: problemId },
    relations: ['tags'],
  });

  if (!problem) {
    throw new NotFoundError('Problem not found');
  }

  const oldTagIds = problem.tags?.map((t) => t.tag_id) || [];

  if (tagIds.length > 0) {
    const tags = await tagRepository.find({
      where: { tag_id: In(tagIds), is_active: true },
    });

    if (tags.length !== tagIds.length) {
      throw new BadRequestError('One or more tags not found or inactive');
    }

    problem.tags = tags;
  } else {
    problem.tags = [];
  }

  await problemRepository.save(problem);

  // Update problem count for all affected tags
  const allTagIds = [...new Set([...oldTagIds, ...tagIds])];
  for (const tagId of allTagIds) {
    await updateProblemCount(tagId);
  }

  return problem;
}

/**
 * Get problems by tag
 */
export async function getProblemsByTag(
  tagId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ problems: Problem[]; total: number }> {
  const tag = await getTagById(tagId);
  const skip = (page - 1) * limit;

  const [problems, total] = await problemRepository
    .createQueryBuilder('problem')
    .innerJoin('problem.tags', 'tag')
    .where('tag.tag_id = :tagId', { tagId })
    .andWhere('problem.is_published = :isPublished', { isPublished: true })
    .orderBy('problem.created_at', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { problems, total };
}

/**
 * Get tags for a problem
 */
export async function getTagsForProblem(problemId: number): Promise<Tag[]> {
  const problem = await problemRepository.findOne({
    where: { problem_id: problemId },
    relations: ['tags'],
  });

  if (!problem) {
    throw new NotFoundError('Problem not found');
  }

  return problem.tags || [];
}

/**
 * Recalculate problem counts for all tags
 */
export async function recalculateAllProblemCounts(): Promise<void> {
  const tags = await tagRepository.find();
  for (const tag of tags) {
    await updateProblemCount(tag.tag_id);
  }
}
