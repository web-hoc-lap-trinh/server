import { Router } from 'express';
import * as TagController from './tag.controller';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @swagger
 * /api/tags/active:
 *   get:
 *     summary: Get all active tags
 *     description: Get all active tags for public use (e.g., filter sidebar)
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of active tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 */
router.get('/active', TagController.getActiveTags);

/**
 * @swagger
 * /api/tags/slug/{slug}:
 *   get:
 *     summary: Get tag by slug
 *     description: Get a tag by its URL-friendly slug
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag slug
 *         example: dynamic-programming
 *     responses:
 *       200:
 *         description: Tag details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found
 */
router.get('/slug/:slug', TagController.getTagBySlug);

/**
 * @swagger
 * /api/tags/{id}/problems:
 *   get:
 *     summary: Get problems by tag
 *     description: Get all published problems associated with a tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of problems with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     problems:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Problem'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Tag not found
 */
router.get('/:id/problems', TagController.getProblemsByTag);

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags with filters (Admin)
 *     description: Get all tags with optional filters and pagination
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, slug, or description
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of tags with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tag'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, checkAdmin, TagController.getTags);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag (Admin)
 *     description: Create a new tag for categorizing problems
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dynamic Programming
 *               slug:
 *                 type: string
 *                 example: dynamic-programming
 *                 description: URL-friendly slug (auto-generated if not provided)
 *               description:
 *                 type: string
 *                 example: Problems involving optimal substructure and overlapping subproblems
 *               color:
 *                 type: string
 *                 example: "#6366f1"
 *                 description: Hex color code for UI display
 *               icon:
 *                 type: string
 *                 example: chart-line
 *                 description: Icon name (e.g., FontAwesome)
 *               order_index:
 *                 type: integer
 *                 example: 1
 *                 description: Order for display (lower = first)
 *               is_active:
 *                 type: boolean
 *                 example: true
 *                 description: Whether tag is visible to users
 *     responses:
 *       201:
 *         description: Tag created successfully
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
 *                   example: Tag created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid input or duplicate tag
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post('/', authMiddleware, checkAdmin, TagController.createTag);

/**
 * @swagger
 * /api/tags/recalculate-counts:
 *   post:
 *     summary: Recalculate problem counts (Admin)
 *     description: Recalculate problem_count for all tags (maintenance operation)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Problem counts recalculated
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
 *                   example: Problem counts recalculated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post('/recalculate-counts', authMiddleware, checkAdmin, TagController.recalculateProblemCounts);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     description: Get a specific tag by ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found
 */
router.get('/:id', TagController.getTagById);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update a tag (Admin)
 *     description: Update an existing tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dynamic Programming
 *               slug:
 *                 type: string
 *                 example: dynamic-programming
 *               description:
 *                 type: string
 *                 example: Updated description
 *               color:
 *                 type: string
 *                 example: "#10b981"
 *               icon:
 *                 type: string
 *                 example: brain
 *               order_index:
 *                 type: integer
 *                 example: 2
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Tag updated successfully
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
 *                   example: Tag updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid input or duplicate tag
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Tag not found
 */
router.put('/:id', authMiddleware, checkAdmin, TagController.updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag (Admin)
 *     description: Delete a tag (will remove associations from problems)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       204:
 *         description: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Tag not found
 */
router.delete('/:id', authMiddleware, checkAdmin, TagController.deleteTag);

/**
 * @swagger
 * /api/tags/{id}/toggle:
 *   patch:
 *     summary: Toggle tag active status (Admin)
 *     description: Toggle a tag's is_active status (show/hide)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag status toggled successfully
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
 *                   example: Tag activated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Tag not found
 */
router.patch('/:id/toggle', authMiddleware, checkAdmin, TagController.toggleTagStatus);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         tag_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Dynamic Programming
 *         slug:
 *           type: string
 *           example: dynamic-programming
 *         description:
 *           type: string
 *           example: Problems involving optimal substructure
 *         color:
 *           type: string
 *           example: "#6366f1"
 *         icon:
 *           type: string
 *           example: chart-line
 *         order_index:
 *           type: integer
 *           example: 1
 *         is_active:
 *           type: boolean
 *           example: true
 *         problem_count:
 *           type: integer
 *           example: 25
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
