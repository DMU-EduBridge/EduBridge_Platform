export interface QuestionGenerationRequest {
  subject: string;
  unit: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number; // 1-10
}

export interface GeneratedQuestion {
  id: string | null;
  title: string;
  description: string;
  content: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  gradeLevel: string;
  unit: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  tags: string[];
  points: number;
  timeLimit: number;
  isActive: boolean;
  isAIGenerated: boolean;
  aiGenerationId: string;
  qualityScore?: number | null;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string | null;
  generationPrompt?: string | null;
  contextChunkIds?: string[] | null;
  modelName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface QuestionGenerationResponse {
  success: boolean;
  data: GeneratedQuestion[];
  error?: string;
}
