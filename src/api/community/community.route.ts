import { Router } from 'express';
import * as communityController from './community.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Community
 *   description: Quản lý Discussions, Replies và Votes
 */

// ======================================================================
// DISCUSSIONS
// ======================================================================

/**
 * @swagger
 * /api/community/discussions:
 *   post:
 *     summary: Tạo một Discussion/Solution mới
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               problem_id:
 *                 type: integer
 *               lesson_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               discussion_type:
 *                 type: string
 *                 enum: [DISCUSSION, QUESTION]
 *               is_solution:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tạo discussion thành công"
 *               data:
 *                 discussion_id: 10
 *                 title: "Ví dụ"
 *                 content: "Nội dung ví dụ..."
 *                 discussion_type: DISCUSSION
 *                 is_solution: false
 *                 created_at: "2025-12-04T10:05:20Z"
 *                 user:
 *                   user_id: 1
 *                   name: Test User
 *       400:
 *         description: Invalid data
 */
router.post('/discussions', authMiddleware, communityController.createDiscussion);


/**
 * @swagger
 * /api/community/discussions:
 *   get:
 *     summary: Lấy danh sách Discussions/Solutions
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: problem_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: lesson_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *       - in: query
 *         name: limit
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Lấy danh sách thành công"
 *               data:
 *                 total: 1
 *                 page: 1
 *                 items:
 *                   - discussion_id: 10
 *                     title: "Ví dụ"
 *                     content: "Nội dung ví dụ..."
 *                     total_replies: 3
 */
router.get('/discussions', communityController.getDiscussions);


/**
 * @swagger
 * /api/community/discussions/{discussionId}:
 *   get:
 *     summary: Lấy chi tiết Discussion/Solution
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success — trả về đầy đủ thông tin discussion
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Lấy thành công"
 *               data:
 *                 discussion_id: 10
 *                 title: "Chi tiết ví dụ"
 *                 content: "Internal content..."
 *                 discussion_type: "DISCUSSION"
 *                 is_solution: false
 *                 total_replies: 5
 *                 upvotes: 12
 *                 downvotes: 0
 *                 created_at: "2025-12-04T10:21:50Z"
 *                 updated_at: "2025-12-04T11:00:00Z"
 *                 user:
 *                   user_id: 2
 *                   name: "User Demo"
 *       404:
 *         description: Not found
 *
 *   put:
 *     summary: Cập nhật Discussion/Solution
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: discussionId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               discussion_type:
 *                 type: string
 *                 enum: [DISCUSSION, QUESTION]
 *               is_solution:
 *                 type: boolean
 *             example:
 *               title: "Updated Title"
 *               content: "Updated content..."
 *               discussion_type: "DISCUSSION"
 *               is_solution: false
 *     responses:
 *       200:
 *         description: Update successful — trả full object sau khi update
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Cập nhật thành công"
 *               data:
 *                 discussion_id: 10
 *                 title: "Updated Title"
 *                 content: "Updated content..."
 *                 discussion_type: "DISCUSSION"
 *                 is_solution: false
 *                 total_replies: 5
 *                 upvotes: 13
 *                 downvotes: 0
 *                 created_at: "2025-12-04T10:21:50Z"
 *                 updated_at: "2025-12-04T11:55:10Z"
 *                 user:
 *                   user_id: 2
 *                   name: "User Demo"
 *
 *   delete:
 *     summary: Xóa Discussion/Solution
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted successfully (No response body)
 */

router.get('/discussions/:discussionId', communityController.getDiscussionDetail);
router.put('/discussions/:discussionId', authMiddleware, communityController.updateDiscussion);
router.delete('/discussions/:discussionId', authMiddleware, communityController.deleteDiscussion);


// ======================================================================
// REPLIES
// ======================================================================

/**
 * @swagger
 * /api/community/discussions/{discussionId}/replies:
 *   post:
 *     summary: Tạo reply/comment mới và trả về đầy đủ dữ liệu
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Đoạn thảo luận của mình là..."
 *               parent_reply_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Reply cha (dùng nếu trả lời một reply khác)
 *                 example: 5
 *     responses:
 *       201:
 *         description: Created full reply object
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tạo reply thành công"
 *               data:
 *                 reply_id: 12
 *                 content: "Đoạn thảo luận của mình là..."
 *                 discussion_id: 7
 *                 created_at: "2025-12-04T10:09:38Z"
 *                 user:
 *                   user_id: 3
 *                   name: "User A"
 *   get:
 *     summary: Lấy danh sách replies của discussion
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 total: 2
 *                 items:
 *                   - reply_id: 12
 *                     content: "Đoạn thảo luận của mình là..."
 *                     user:
 *                       user_id: 3
 *                       name: "User A"
 *                   - reply_id: 13
 *                     content: "Mình đồng ý"
 *                     user:
 *                       user_id: 4
 *                       name: "User B"
 */
router.post('/discussions/:discussionId/replies', authMiddleware, communityController.createReply);
router.get('/discussions/:discussionId/replies', communityController.getReplies);


/**
 * @swagger
 * /api/community/replies/{replyId}:
 *   delete:
 *     summary: Xóa reply
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Deleted successfully
 */
router.delete('/replies/:replyId', authMiddleware, communityController.deleteReply);


// ======================================================================
// VOTES
// ======================================================================

/**
 * @swagger
 * /api/community/votes:
 *   post:
 *     summary: Vote cho Discussion hoặc Reply
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discussion_id:
 *                 type: number
 *               reply_id:
 *                 type: number
 *               vote_type:
 *                 type: string
 *                 enum: [UPVOTE, DOWNVOTE]
 *     responses:
 *       200:
 *         description: Trả về tổng vote mới sau xử lý
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Vote thành công"
 *               data:
 *                 upvotes: 15
 *                 downvotes: 2
 *                 user_vote: "UPVOTE"
 */
router.post('/votes', authMiddleware, communityController.handleVote);

export default router;
