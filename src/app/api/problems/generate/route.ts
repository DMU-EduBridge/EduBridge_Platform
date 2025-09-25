import { authOptions } from '@/lib/core/auth';
import { llmProblemService } from '@/server/services/llm-problem.service';
import { LLMProblemGenerationRequest, LLMProblemGenerationResponse } from '@/types/domain/problem';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 학생은 문제 생성할 수 없음
    if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: LLMProblemGenerationRequest = await request.json();

    // 요청 검증
    if (!body.subject || !body.difficulty || !body.count) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, difficulty, count' },
        { status: 400 },
      );
    }

    if (body.count < 1 || body.count > 10) {
      return NextResponse.json({ error: 'Count must be between 1 and 10' }, { status: 400 });
    }

    // LLM 서비스를 사용하여 문제 생성
    const response = await llmProblemService.generateProblems(body);

    // 생성된 문제들의 품질 검증 및 점수 계산
    const validatedQuestions = response.questions.map((question) => {
      const isValid = llmProblemService.validateProblem(question);
      const qualityScore = llmProblemService.calculateQualityScore(question);

      return {
        ...question,
        qualityScore: isValid ? qualityScore : 0,
        isValid,
      };
    });

    const finalResponse: LLMProblemGenerationResponse = {
      ...response,
      questions: validatedQuestions,
    };

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('Error generating problems:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
