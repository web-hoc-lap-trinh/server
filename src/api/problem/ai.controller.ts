import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
import * as aiService from './ai.service';
import { successResponse, BadRequestError } from '../../utils/apiResponse';

/**
 * POST /problems/:problemId/ai/chat
 * Send a message to AI and get response
 */
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const problemId = parseInt(req.params.problemId);
  if (isNaN(problemId)) throw new BadRequestError('Invalid problemId');

  const userId = req.user?.user_id;
  if (!userId) throw new BadRequestError('Authentication required');

  const { conversationId = null, message } = req.body;
  if (!message || typeof message !== 'string') throw new BadRequestError('message is required');

  const result = await aiService.chat(problemId, userId, conversationId, message);
  successResponse(res, 'AI response', result);
});

/**
 * GET /problems/:problemId/ai/conversation
 * Get or create conversation for a problem
 */
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const problemId = parseInt(req.params.problemId);
  if (isNaN(problemId)) throw new BadRequestError('Invalid problemId');

  const userId = req.user?.user_id;
  if (!userId) throw new BadRequestError('Authentication required');

  const conv = await aiService.getOrCreateConversation(problemId, userId);
  const messages = await aiService.getMessages(conv.id, userId);

  successResponse(res, 'Conversation retrieved', {
    conversation: conv,
    messages,
  });
});

/**
 * GET /problems/:problemId/ai/messages
 * Get all messages for the conversation of a problem
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const problemId = parseInt(req.params.problemId);
  if (isNaN(problemId)) throw new BadRequestError('Invalid problemId');

  const userId = req.user?.user_id;
  if (!userId) throw new BadRequestError('Authentication required');

  const conv = await aiService.getConversationByProblem(problemId, userId);
  if (!conv) {
    successResponse(res, 'No conversation found', { messages: [] });
    return;
  }

  const messages = await aiService.getMessages(conv.id, userId);
  successResponse(res, 'Messages retrieved', {
    conversationId: conv.id,
    messages,
  });
});

/**
 * DELETE /problems/:problemId/ai/conversation
 * Delete the conversation for a problem
 */
export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  const problemId = parseInt(req.params.problemId);
  if (isNaN(problemId)) throw new BadRequestError('Invalid problemId');

  const userId = req.user?.user_id;
  if (!userId) throw new BadRequestError('Authentication required');

  const conv = await aiService.getConversationByProblem(problemId, userId);
  if (conv) {
    await aiService.deleteConversation(conv.id, userId);
  }

  successResponse(res, 'Conversation deleted');
});

/**
 * DELETE /problems/:problemId/ai/messages
 * Clear all messages in the conversation (keep conversation)
 */
export const clearMessages = asyncHandler(async (req: Request, res: Response) => {
  const problemId = parseInt(req.params.problemId);
  if (isNaN(problemId)) throw new BadRequestError('Invalid problemId');

  const userId = req.user?.user_id;
  if (!userId) throw new BadRequestError('Authentication required');

  const conv = await aiService.getConversationByProblem(problemId, userId);
  if (conv) {
    await aiService.clearMessages(conv.id, userId);
  }

  successResponse(res, 'Messages cleared');
});

/**
 * GET /ai/conversations
 * Get all AI conversations for the current user
 */
export const getAllConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.user_id;
  if (!userId) throw new BadRequestError('Authentication required');

  const conversations = await aiService.getUserConversations(userId);
  successResponse(res, 'Conversations retrieved', conversations);
});
