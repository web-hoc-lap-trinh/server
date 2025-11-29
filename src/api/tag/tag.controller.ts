import { Request, Response, NextFunction } from 'express';
import * as TagService from './tag.service';
import { successResponse, createdResponse, noContentResponse, BadRequestError } from '../../utils/apiResponse';

// ==========================================
// TAG CRUD CONTROLLERS
// ==========================================

/**
 * Create a new tag
 * POST /api/tags
 */
export async function createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, slug, description, color, icon, order_index, is_active } = req.body;

    if (!name) {
      throw new BadRequestError('Tag name is required');
    }

    const tag = await TagService.createTag({
      name,
      slug,
      description,
      color,
      icon,
      order_index,
      is_active,
    });

    createdResponse(res, 'Tag created successfully', tag);
  } catch (error) {
    next(error);
  }
}

/**
 * Get all tags with filters (admin)
 * GET /api/tags
 */
export async function getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, is_active, page, limit } = req.query;

    const result = await TagService.getTags({
      search: search as string,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    successResponse(res, 'Tags retrieved successfully', {
      tags: result.tags,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
        total_pages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 50)),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all active tags (public)
 * GET /api/tags/active
 */
export async function getActiveTags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await TagService.getActiveTags();
    successResponse(res, 'Active tags retrieved successfully', tags);
  } catch (error) {
    next(error);
  }
}

/**
 * Get tag by ID
 * GET /api/tags/:id
 */
export async function getTagById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tagId = parseInt(req.params.id);
    if (isNaN(tagId)) {
      throw new BadRequestError('Invalid tag ID');
    }

    const tag = await TagService.getTagById(tagId);
    successResponse(res, 'Tag retrieved successfully', tag);
  } catch (error) {
    next(error);
  }
}

/**
 * Get tag by slug
 * GET /api/tags/slug/:slug
 */
export async function getTagBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const tag = await TagService.getTagBySlug(slug);
    successResponse(res, 'Tag retrieved successfully', tag);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a tag
 * PUT /api/tags/:id
 */
export async function updateTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tagId = parseInt(req.params.id);
    if (isNaN(tagId)) {
      throw new BadRequestError('Invalid tag ID');
    }

    const { name, slug, description, color, icon, order_index, is_active } = req.body;

    const tag = await TagService.updateTag(tagId, {
      name,
      slug,
      description,
      color,
      icon,
      order_index,
      is_active,
    });

    successResponse(res, 'Tag updated successfully', tag);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a tag
 * DELETE /api/tags/:id
 */
export async function deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tagId = parseInt(req.params.id);
    if (isNaN(tagId)) {
      throw new BadRequestError('Invalid tag ID');
    }

    await TagService.deleteTag(tagId);
    noContentResponse(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle tag active status
 * PATCH /api/tags/:id/toggle
 */
export async function toggleTagStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tagId = parseInt(req.params.id);
    if (isNaN(tagId)) {
      throw new BadRequestError('Invalid tag ID');
    }

    const tag = await TagService.toggleTagStatus(tagId);
    successResponse(res, `Tag ${tag.is_active ? 'activated' : 'deactivated'} successfully`, tag);
  } catch (error) {
    next(error);
  }
}

// ==========================================
// PROBLEM-TAG RELATION CONTROLLERS
// ==========================================

/**
 * Add tags to a problem
 * POST /api/problems/:id/tags
 */
export async function addTagsToProblem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const problemId = parseInt(req.params.id);
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const { tag_ids } = req.body;
    if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
      throw new BadRequestError('tag_ids must be a non-empty array');
    }

    const problem = await TagService.addTagsToProblem(problemId, tag_ids);
    successResponse(res, 'Tags added to problem successfully', problem.tags);
  } catch (error) {
    next(error);
  }
}

/**
 * Remove tags from a problem
 * DELETE /api/problems/:id/tags
 */
export async function removeTagsFromProblem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const problemId = parseInt(req.params.id);
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const { tag_ids } = req.body;
    if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
      throw new BadRequestError('tag_ids must be a non-empty array');
    }

    const problem = await TagService.removeTagsFromProblem(problemId, tag_ids);
    successResponse(res, 'Tags removed from problem successfully', problem.tags);
  } catch (error) {
    next(error);
  }
}

/**
 * Set tags for a problem (replace all)
 * PUT /api/problems/:id/tags
 */
export async function setTagsForProblem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const problemId = parseInt(req.params.id);
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const { tag_ids } = req.body;
    if (!Array.isArray(tag_ids)) {
      throw new BadRequestError('tag_ids must be an array');
    }

    const problem = await TagService.setTagsForProblem(problemId, tag_ids);
    successResponse(res, 'Tags updated for problem successfully', problem.tags);
  } catch (error) {
    next(error);
  }
}

/**
 * Get problems by tag
 * GET /api/tags/:id/problems
 */
export async function getProblemsByTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tagId = parseInt(req.params.id);
    if (isNaN(tagId)) {
      throw new BadRequestError('Invalid tag ID');
    }

    const { page, limit } = req.query;
    const result = await TagService.getProblemsByTag(
      tagId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    successResponse(res, 'Problems retrieved successfully', {
      problems: result.problems,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        total_pages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 20)),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get tags for a problem
 * GET /api/problems/:id/tags
 */
export async function getTagsForProblem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const problemId = parseInt(req.params.id);
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const tags = await TagService.getTagsForProblem(problemId);
    successResponse(res, 'Tags retrieved successfully', tags);
  } catch (error) {
    next(error);
  }
}

/**
 * Recalculate problem counts for all tags (admin maintenance)
 * POST /api/tags/recalculate-counts
 */
export async function recalculateProblemCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await TagService.recalculateAllProblemCounts();
    successResponse(res, 'Problem counts recalculated successfully');
  } catch (error) {
    next(error);
  }
}
