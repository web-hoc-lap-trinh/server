import { AppDataSource } from '../../config/data-source';
import { AiConversation } from './ai-conversation.entity';
import { AiMessage } from './ai-message.entity';
import { Problem } from './problem.entity';
import { Submission } from '../submission/submission.entity';
import { callLLM } from '../../services/llm.service';
import { NotFoundError } from '../../utils/apiResponse';

const convRepo = AppDataSource.getRepository(AiConversation);
const msgRepo = AppDataSource.getRepository(AiMessage);
const problemRepo = AppDataSource.getRepository(Problem);
const submissionRepo = AppDataSource.getRepository(Submission);

interface ChatResult {
  conversationId: number;
  answer: string;
  provider: string;
  messages: AiMessage[];
}

/**
 * Build multi-turn messages array for LLM.
 * Includes problem context, recent submissions, and conversation history.
 */
const buildMessages = (
  problem: Problem,
  history: AiMessage[],
  newUserMessage: string,
  recentSubmissions: Submission[] = []
) => {
  const maxHistory = 20; // include up to last 20 messages
  const sliced = history.slice(Math.max(0, history.length - maxHistory));

  // System message with problem context
  let systemContent = `Bạn là trợ lý AI giúp học sinh giải bài toán lập trình. 

## QUY TẮC TRẢ LỜI:
1. **Ngắn gọn, đúng trọng tâm** - Chỉ trả lời những gì học sinh hỏi
2. **KHÔNG được hiển thị ID bài nộp** (như "ID: 17") trong câu trả lời
3. **Format rõ ràng** để dễ hiển thị trên web:
   - Dùng **in đậm** cho điểm quan trọng
   - Dùng \`code inline\` cho tên biến, hàm
   - Dùng code block có syntax highlight cho code
   - Dùng bullet points cho danh sách
4. **Khi phân tích lỗi code:**
   - Chỉ ra lỗi chính ngay đầu tiên
   - Đưa code đã sửa (chỉ phần cần sửa, không cần toàn bộ nếu chỉ sửa 1-2 dòng)
   - Giải thích ngắn gọn tại sao lỗi
5. **Không giải thích những thứ cơ bản** trừ khi học sinh hỏi (như #include là gì, main() là gì...)
6. **Không đưa code hoàn chỉnh** trừ khi học sinh yêu cầu rõ ràng

## THÔNG TIN BÀI TOÁN:
**${problem.title}**

${problem.description}
`;

  if ((problem as any).input_format) {
    systemContent += `\n**Input:** ${(problem as any).input_format}`;
  }
  if ((problem as any).output_format) {
    systemContent += `\n**Output:** ${(problem as any).output_format}`;
  }
  if ((problem as any).constraints) {
    systemContent += `\n**Constraints:** ${(problem as any).constraints}`;
  }

  // Add recent submissions context (internal use only - AI should not expose IDs)
  if (recentSubmissions.length > 0) {
    systemContent += `\n\n## LỊCH SỬ NỘP BÀI (Dữ liệu nội bộ - KHÔNG hiển thị ID cho học sinh):\n`;
    
    for (let i = 0; i < recentSubmissions.length; i++) {
      const sub = recentSubmissions[i];
      const isLatest = i === recentSubmissions.length - 1;
      
      systemContent += `\n### Bài nộp ${isLatest ? 'GẦN NHẤT' : `#${i + 1}`}:\n`;
      systemContent += `- Ngôn ngữ: ${sub.language || 'N/A'}\n`;
      systemContent += `- Kết quả: **${sub.status}**\n`;
      systemContent += `- Test cases: ${sub.test_cases_passed}/${sub.total_test_cases}\n`;
      
      // Include source code
      systemContent += `- Code:\n\`\`\`${sub.language?.toLowerCase() || ''}\n${sub.source_code}\n\`\`\`\n`;
      
      // Include error details if any
      if (sub.status === 'COMPILE_ERROR' && sub.execution_logs?.compile_output) {
        systemContent += `- Lỗi biên dịch:\n\`\`\`\n${sub.execution_logs.compile_output}\n\`\`\`\n`;
      }
      if (sub.error_message) {
        systemContent += `- Lỗi: ${sub.error_message}\n`;
      }
      
      // Include sample test case results
      if (sub.execution_logs?.test_case_results) {
        const sampleResults = sub.execution_logs.test_case_results.filter(tc => tc.is_sample);
        if (sampleResults.length > 0 && sub.status !== 'COMPILE_ERROR') {
          systemContent += `- Test mẫu:\n`;
          for (const tc of sampleResults) {
            if (tc.expected_output && tc.actual_output !== undefined) {
              systemContent += `  + ${tc.status}: Expected "${tc.expected_output}" → Got "${tc.actual_output}"\n`;
            }
          }
        }
      }
    }
  }

  const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
    { role: 'system', content: systemContent },
  ];

  // Add history
  for (const m of sliced) {
    messages.push({
      role: m.role as 'user' | 'assistant',
      content: m.message,
    });
  }

  // Add new user message
  messages.push({ role: 'user', content: newUserMessage });

  return messages;
};

// ==================== CRUD Operations ====================

/**
 * Get or create conversation for a problem+user
 */
export const getOrCreateConversation = async (problemId: number, userId: number): Promise<AiConversation> => {
  const problem = await problemRepo.findOneBy({ problem_id: problemId });
  if (!problem) throw new NotFoundError('Problem not found');

  let conv = await convRepo.findOne({
    where: { problem_id: problemId, user_id: userId },
  });

  if (!conv) {
    conv = convRepo.create({ problem_id: problemId, user_id: userId });
    conv = await convRepo.save(conv);
  }

  return conv;
};

/**
 * Get conversation by ID (with ownership check)
 */
export const getConversationById = async (conversationId: number, userId: number): Promise<AiConversation> => {
  const conv = await convRepo.findOne({
    where: { id: conversationId, user_id: userId },
    relations: ['problem'],
  });
  if (!conv) throw new NotFoundError('Conversation not found');
  return conv;
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: number): Promise<AiConversation[]> => {
  return convRepo.find({
    where: { user_id: userId },
    relations: ['problem'],
    order: { created_at: 'DESC' },
  });
};

/**
 * Get conversation for a specific problem+user
 */
export const getConversationByProblem = async (problemId: number, userId: number): Promise<AiConversation | null> => {
  return convRepo.findOne({
    where: { problem_id: problemId, user_id: userId },
    relations: ['problem'],
  });
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId: number, userId: number): Promise<AiMessage[]> => {
  // Verify ownership
  const conv = await convRepo.findOne({ where: { id: conversationId, user_id: userId } });
  if (!conv) throw new NotFoundError('Conversation not found');

  return msgRepo.find({
    where: { conversation_id: conversationId },
    order: { created_at: 'ASC' },
  });
};

/**
 * Delete a conversation and all its messages
 */
export const deleteConversation = async (conversationId: number, userId: number): Promise<void> => {
  const conv = await convRepo.findOne({ where: { id: conversationId, user_id: userId } });
  if (!conv) throw new NotFoundError('Conversation not found');

  // Messages will be deleted by CASCADE
  await convRepo.remove(conv);
};

/**
 * Clear all messages in a conversation (keep conversation)
 */
export const clearMessages = async (conversationId: number, userId: number): Promise<void> => {
  const conv = await convRepo.findOne({ where: { id: conversationId, user_id: userId } });
  if (!conv) throw new NotFoundError('Conversation not found');

  await msgRepo.delete({ conversation_id: conversationId });
};

// ==================== Chat Function ====================

/**
 * Send a message and get AI response
 */
export const chat = async (
  problemId: number,
  userId: number,
  conversationId: number | null,
  message: string
): Promise<ChatResult> => {
  // 1. Ensure problem exists
  const problem = await problemRepo.findOneBy({ problem_id: problemId });
  if (!problem) throw new NotFoundError('Problem not found');

  // 2. Get or create conversation
  let conv: AiConversation | null = null;
  if (conversationId) {
    conv = await convRepo.findOne({ where: { id: conversationId, user_id: userId } });
    if (!conv) throw new NotFoundError('Conversation not found');
  } else {
    conv = await convRepo.findOne({ where: { problem_id: problemId, user_id: userId } });
  }

  if (!conv) {
    conv = convRepo.create({ problem_id: problemId, user_id: userId });
    conv = await convRepo.save(conv);
  }

  // 3. Fetch recent submissions for this problem by this user (last 5)
  const recentSubmissions = await submissionRepo.find({
    where: { problem_id: problemId, user_id: userId },
    order: { submitted_at: 'DESC' },
    take: 5,
  });
  // Reverse to show oldest first (chronological order)
  recentSubmissions.reverse();

  // 4. Save user message first
  const userMsg = msgRepo.create({ conversation_id: conv.id, role: 'user', message });
  await msgRepo.save(userMsg);

  // 5. Load history (excluding the message we just saved, we'll add it in buildMessages)
  const history = await msgRepo.find({
    where: { conversation_id: conv.id },
    order: { created_at: 'ASC' },
  });

  // Remove the last message (the one we just added) from history for building prompt
  const historyForPrompt = history.slice(0, -1);

  // 6. Build messages and call LLM (include submissions context)
  const llmMessages = buildMessages(problem, historyForPrompt, message, recentSubmissions);
  const llmResponse = await callLLM(llmMessages);

  // 7. Save assistant message
  const assistantMsg = msgRepo.create({
    conversation_id: conv.id,
    role: 'assistant',
    message: llmResponse.answer,
  });
  await msgRepo.save(assistantMsg);

  // 8. Return all messages
  const allMessages = await msgRepo.find({
    where: { conversation_id: conv.id },
    order: { created_at: 'ASC' },
  });

  return {
    conversationId: conv.id,
    answer: llmResponse.answer,
    provider: llmResponse.provider,
    messages: allMessages,
  };
};
