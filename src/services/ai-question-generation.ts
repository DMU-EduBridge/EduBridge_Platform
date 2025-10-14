import { api } from '@/lib/core/api';
import {
  QuestionGenerationRequest,
  QuestionGenerationResponse,
} from '@/types/ai-question-generation';

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000';

export const aiQuestionGenerationService = {
  /**
   * FastAPI 서버를 통해 AI 문제 생성
   */
  generateQuestions: async (
    request: QuestionGenerationRequest,
  ): Promise<QuestionGenerationResponse> => {
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/generate-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: Array.isArray(data) ? data : [data],
      };
    } catch (error: any) {
      console.error('AI 문제 생성 실패:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'AI 문제 생성 중 오류가 발생했습니다.',
      };
    }
  },

  /**
   * 생성된 문제를 데이터베이스에 저장
   */
  saveGeneratedQuestions: async (questions: any[], _createdBy: string) => {
    return api
      .post('/problems/batch', {
        problems: questions.map((q) => ({
          title: q.title,
          content: q.content,
          type:
            q.type === 'multiple_choice'
              ? 'MULTIPLE_CHOICE'
              : q.type === 'short_answer'
                ? 'SHORT_ANSWER'
                : 'ESSAY',
          difficulty:
            q.difficulty === 'easy' ? 'EASY' : q.difficulty === 'medium' ? 'MEDIUM' : 'HARD',
          subject:
            q.subject === '수학'
              ? 'MATH'
              : q.subject === '영어'
                ? 'ENGLISH'
                : q.subject === '과학'
                  ? 'SCIENCE'
                  : 'OTHER',
          gradeLevel: q.gradeLevel
            ? q.gradeLevel === 'Middle-1'
              ? 'GRADE_7'
              : q.gradeLevel === 'Middle-2'
                ? 'GRADE_8'
                : q.gradeLevel === 'Middle-3'
                  ? 'GRADE_9'
                  : 'GRADE_10'
            : 'GRADE_9', // 기본값
          options: q.options || [],
          correctAnswer:
            q.options && q.options.length > 0 && !isNaN(Number(q.correctAnswer))
              ? q.options[Number(q.correctAnswer) - 1] || q.correctAnswer
              : q.correctAnswer,
          explanation: q.explanation || '',
          hints: q.hints || [],
          tags: q.tags || [],
          points: q.points || 10,
          timeLimit: q.timeLimit || 60,
          isAIGenerated: true,
          aiGenerationId: q.aiGenerationId,
          modelName: q.modelName,
        })),
      })
      .then((res) => res.data);
  },
};
