/**
 * 문제 생성을 위한 간소화된 Factory Pattern
 */

import type { CreateProblemRequest, Problem } from '@/types/domain/problem';

// LLM에서 받아오는 데이터 타입 정의
export interface LLMProblemData {
  question?: string;
  title?: string;
  content?: string;
  difficulty?: string;
  subject?: string;
  options?: string[];
  correct_answer?: number;
  explanation?: string;
  hint?: string;
  gradeLevel?: string | number;
}

// 문제 팩토리 인터페이스
export interface ProblemFactory {
  createFromTemplate(templateId: string, overrides?: Partial<CreateProblemRequest>): Problem;
  createFromLLM(llmData: LLMProblemData): CreateProblemRequest;
  createBatch(requests: CreateProblemRequest[]): Problem[];
}

// 문제 팩토리 구현
export class ConcreteProblemFactory implements ProblemFactory {
  private static instance: ConcreteProblemFactory;
  private idCounter = 1;

  static getInstance(): ConcreteProblemFactory {
    if (!ConcreteProblemFactory.instance) {
      ConcreteProblemFactory.instance = new ConcreteProblemFactory();
    }
    return ConcreteProblemFactory.instance;
  }

  private generateId(): string {
    return `problem-${this.idCounter++}`;
  }

  private createBaseProblem(data: CreateProblemRequest): Problem {
    const now = new Date();
    return {
      id: this.generateId(),
      title: data.title,
      description: data.description || null,
      content: data.content,
      type: data.type,
      difficulty: data.difficulty,
      subject: data.subject,
      options: data.options || [],
      correctAnswer: data.correctAnswer || '',
      explanation: data.explanation || null,
      hints: data.hint ? [data.hint] : [],
      points: 10, // 기본값
      timeLimit: null,
      gradeLevel: data.gradeLevel as
        | 'GRADE_1'
        | 'GRADE_2'
        | 'GRADE_3'
        | 'GRADE_4'
        | 'GRADE_5'
        | 'GRADE_6'
        | 'GRADE_7'
        | 'GRADE_8'
        | 'GRADE_9'
        | 'GRADE_10'
        | 'GRADE_11'
        | 'GRADE_12'
        | null,
      unit: data.unit || null,
      tags: data.tags || [],
      attachments: data.attachments || [],
      isAIGenerated: data.isAIGenerated || false,
      reviewStatus: data.reviewStatus || 'PENDING',
      status: data.status || 'DRAFT',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      createdBy: 'system',
    };
  }

  createFromTemplate(templateId: string, overrides: Partial<CreateProblemRequest> = {}): Problem {
    const template = this.getTemplate(templateId);
    const mergedParams = { ...template, ...overrides };
    return this.createBaseProblem(mergedParams);
  }

  createFromLLM(llmData: LLMProblemData): CreateProblemRequest {
    const data: CreateProblemRequest = {
      title: llmData.question || llmData.title || 'AI 생성 문제',
      content: llmData.question || llmData.content || '문제 내용',
      type: 'MULTIPLE_CHOICE',
      difficulty:
        (llmData.difficulty?.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT') || 'EASY',
      subject:
        (llmData.subject as
          | 'MATH'
          | 'KOREAN'
          | 'ENGLISH'
          | 'SCIENCE'
          | 'SOCIAL_STUDIES'
          | 'HISTORY'
          | 'GEOGRAPHY'
          | 'PHYSICS'
          | 'CHEMISTRY'
          | 'BIOLOGY'
          | 'COMPUTER_SCIENCE'
          | 'ART'
          | 'MUSIC'
          | 'PHYSICAL_EDUCATION'
          | 'ETHICS'
          | 'OTHER') || 'MATH',
      options: llmData.options || ['A', 'B', 'C', 'D'],
      correctAnswer: llmData.options?.[llmData.correct_answer || 0] || 'A',
      explanation: llmData.explanation || '',
      hint: llmData.hint || '',
      isAIGenerated: true,
      reviewStatus: 'PENDING',
    };
    return data;
  }

  createBatch(requests: CreateProblemRequest[]): Problem[] {
    return requests.map((request) => this.createBaseProblem(request));
  }

  private getTemplate(templateId: string): CreateProblemRequest {
    const templates: Record<string, CreateProblemRequest> = {
      'math-basic': {
        title: '기본 수학 문제',
        content: '다음 중 올바른 답은?',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        subject: 'MATH',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: '정답은 A입니다.',
      },
      'korean-reading': {
        title: '국어 독해 문제',
        content: '다음 글의 중심 내용은?',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        subject: 'KOREAN',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: '정답은 A입니다.',
      },
      'english-grammar': {
        title: '영어 문법 문제',
        content: '다음 중 문법적으로 올바른 문장은?',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        subject: 'ENGLISH',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: '정답은 A입니다.',
      },
    };

    return (
      templates[templateId] ||
      templates['math-basic'] || {
        title: '기본 문제',
        content: '문제 내용을 입력하세요',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        subject: 'MATH',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: '정답은 A입니다.',
      }
    );
  }
}

// 전역 팩토리 인스턴스
export const problemFactory = ConcreteProblemFactory.getInstance();
