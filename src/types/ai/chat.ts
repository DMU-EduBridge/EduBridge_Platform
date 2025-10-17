export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequestMeta {
  grade?: string;
  subject?: string;
  unit?: string;
}

export interface ChatRequest {
  sessionId: string;
  messages: ChatMessage[];
  meta?: ChatRequestMeta;
}

export interface ChatUsage {
  tokensPrompt: number;
  tokensCompletion: number;
  tokensTotal: number;
}

export interface ChatCitation {
  id: string;
  title: string;
  page?: number;
  url?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage; // assistant message
  citations?: ChatCitation[];
  usage?: ChatUsage;
}

// Structured error model for robust handling (non-breaking: UI can still use string)
export interface ChatError {
  code: 'ABORTED' | 'NETWORK' | 'SERVER' | 'RATE_LIMIT' | 'UNKNOWN';
  message: string;
  cause?: unknown;
  retriable?: boolean;
}

// Streaming delta event for incremental assistant tokens
export interface ChatDelta {
  role: 'assistant';
  delta: string;
  done?: boolean;
}

// Optional event hooks associated with chat lifecycle
export interface ChatEvents {
  onDelta?: (delta: ChatDelta) => void;
  onUsage?: (u: ChatUsage) => void;
  onCitations?: (c: ChatCitation[]) => void;
}
