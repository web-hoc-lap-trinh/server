/**
 * Shared LLM Service
 *
 * Supports multiple providers:
 * - Gemini (Google AI Studio) via GEMINI_API_KEY
 * - OpenAI via OPENAI_API_KEY
 *
 * Priority: Gemini first if GEMINI_API_KEY is set; otherwise OpenAI.
 */

export type LLMProvider = 'gemini' | 'openai' | 'none';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMResponse {
  provider: LLMProvider;
  answer: string;
}

/**
 * Detect which provider is configured
 */
export function detectProvider(): LLMProvider {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'none';
}

/**
 * Call the LLM with a list of messages (multi-turn).
 */
export async function callLLM(messages: ChatMessage[]): Promise<LLMResponse> {
  const provider = detectProvider();

  if (provider === 'none') {
    return {
      provider: 'none',
      answer: 'Gợi ý (offline): Chưa cấu hình LLM API key. Vui lòng đặt GEMINI_API_KEY hoặc OPENAI_API_KEY trong .env',
    };
  }

  if (provider === 'gemini') {
    return callGemini(messages);
  }

  return callOpenAI(messages);
}

/**
 * Build a single prompt string from messages (for Gemini generateContent).
 */
function buildPromptFromMessages(messages: ChatMessage[]): string {
  return messages
    .map((m) => {
      const prefix = m.role === 'user' ? 'User' : m.role === 'assistant' ? 'Assistant' : 'System';
      return `${prefix}: ${m.content}`;
    })
    .join('\n') + '\nAssistant:';
}

/**
 * Call Gemini (Google AI Studio) API
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Available models: gemini-2.0-flash, gemini-2.5-flash, gemini-1.5-pro-latest
 */
async function callGemini(messages: ChatMessage[]): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Gemini uses "contents" array with parts
  // For multi-turn, convert messages to contents format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user', // Gemini uses 'model' instead of 'assistant'
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  try {
    const fetchImpl = await getFetch();
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('[LLM] Gemini error:', res.status, txt);
      return { provider: 'gemini', answer: `Lỗi Gemini API: ${res.status}` };
    }

    const data: any = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { provider: 'gemini', answer: answer.trim() };
  } catch (err: any) {
    console.error('[LLM] Gemini call error:', err.message);
    return { provider: 'gemini', answer: `Lỗi khi gọi Gemini: ${err.message}` };
  }
}

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAI(messages: ChatMessage[]): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const body = {
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: 1024,
    temperature: 0.7,
  };

  try {
    const fetchImpl = await getFetch();
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('[LLM] OpenAI error:', res.status, txt);
      return { provider: 'openai', answer: `Lỗi OpenAI API: ${res.status}` };
    }

    const data: any = await res.json();
    const answer = data?.choices?.[0]?.message?.content || '';
    return { provider: 'openai', answer: answer.trim() };
  } catch (err: any) {
    console.error('[LLM] OpenAI call error:', err.message);
    return { provider: 'openai', answer: `Lỗi khi gọi OpenAI: ${err.message}` };
  }
}

/**
 * Get fetch implementation (global or node-fetch fallback)
 */
async function getFetch(): Promise<typeof fetch> {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch;
  }
  // @ts-ignore - optional dynamic import
  const mod = await import('node-fetch');
  return mod.default as any;
}
