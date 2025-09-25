import {
  LLMGeneratedProblem,
  LLMProblemGenerationRequest,
  LLMProblemGenerationResponse,
} from '@/types/domain/problem';

export class LLMProblemService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  /**
   * LLM을 사용하여 문제 생성
   */
  async generateProblems(
    request: LLMProblemGenerationRequest,
  ): Promise<LLMProblemGenerationResponse> {
    try {
      // 실제 OpenAI API 호출
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request),
            },
            {
              role: 'user',
              content: this.getUserPrompt(request),
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // JSON 파싱
      const parsedContent = JSON.parse(content);

      return {
        generated_at: new Date().toISOString(),
        total_questions: parsedContent.total_questions || parsedContent.questions?.length || 0,
        questions: parsedContent.questions || [],
      };
    } catch (error) {
      console.error('Error generating problems with LLM:', error);

      // API 실패 시 폴백 데이터 반환
      return this.getFallbackProblems(request);
    }
  }

  /**
   * 시스템 프롬프트 생성
   */
  private getSystemPrompt(request: LLMProblemGenerationRequest): string {
    return `당신은 교육 전문가입니다. 주어진 조건에 맞는 고품질의 객관식 문제를 생성해주세요.

요구사항:
1. 문제는 명확하고 이해하기 쉬워야 합니다
2. 선택지는 모두 합리적이어야 하며, 정답이 명확해야 합니다
3. 해설은 정답의 근거를 명확히 설명해야 합니다
4. 힌트는 문제 해결에 도움이 되는 단서를 제공해야 합니다
5. 문제는 교육적 가치가 있어야 합니다

응답 형식:
{
  "total_questions": ${request.count},
  "questions": [
    {
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4", "선택지5"],
      "correct_answer": 0,
      "explanation": "해설",
      "hint": "힌트",
      "difficulty": "${request.difficulty}",
      "subject": "${request.subject}",
      "unit": "${request.unit || ''}",
      "generated_at": "${new Date().toISOString()}",
      "id": "unique_id"
    }
  ]
}`;
  }

  /**
   * 사용자 프롬프트 생성
   */
  private getUserPrompt(request: LLMProblemGenerationRequest): string {
    return `${request.subject} 과목의 ${request.unit ? `${request.unit} 단원` : '전반적인 내용'}에 대한 ${request.difficulty} 난이도의 객관식 문제 ${request.count}개를 생성해주세요.

난이도별 특징:
- easy: 기본 개념 이해 문제
- medium: 응용 및 분석 문제  
- hard: 종합적 사고 문제
- expert: 창의적 문제 해결 문제

각 문제마다 고유한 ID를 생성해주세요.`;
  }

  /**
   * API 실패 시 폴백 문제 생성
   */
  private getFallbackProblems(request: LLMProblemGenerationRequest): LLMProblemGenerationResponse {
    const problems: LLMGeneratedProblem[] = [];

    for (let i = 0; i < request.count; i++) {
      problems.push({
        question: `${request.subject} ${request.unit ? `- ${request.unit}` : ''} 관련 문제 ${i + 1}입니다.`,
        options: ['선택지 1', '선택지 2', '선택지 3', '선택지 4', '선택지 5'],
        correct_answer: 1,
        explanation: '이 문제의 정답에 대한 상세한 설명입니다.',
        hint: '문제를 해결하는 데 도움이 되는 힌트입니다.',
        difficulty: request.difficulty,
        subject: request.subject,
        unit: request.unit || '',
        generated_at: new Date().toISOString(),
        id: `${request.subject}_${request.difficulty}_${Date.now()}_${i}`,
      });
    }

    return {
      generated_at: new Date().toISOString(),
      total_questions: problems.length,
      questions: problems,
    };
  }

  /**
   * 문제 품질 검증
   */
  validateProblem(problem: LLMGeneratedProblem): boolean {
    return !!(
      problem.question &&
      problem.options &&
      problem.options.length >= 2 &&
      problem.options.length <= 5 &&
      problem.correct_answer >= 0 &&
      problem.correct_answer < problem.options.length &&
      problem.explanation &&
      problem.subject &&
      problem.difficulty
    );
  }

  /**
   * 문제 품질 점수 계산
   */
  calculateQualityScore(problem: LLMGeneratedProblem): number {
    let score = 0;

    // 기본 점수
    if (problem.question.length > 20) score += 20;
    if (problem.options.length >= 4) score += 20;
    if (problem.explanation.length > 30) score += 20;
    if (problem.hint && problem.hint.length > 10) score += 20;
    if (problem.unit && problem.unit.length > 0) score += 20;

    return Math.min(score, 100);
  }
}

// 싱글톤 인스턴스
export const llmProblemService = new LLMProblemService();
