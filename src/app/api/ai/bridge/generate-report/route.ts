import { RetryManager } from '@/lib/ai-server/retry-manager';
import { AI_TIMEOUT_CONFIG, fetchWithTimeout } from '@/lib/ai-server/timeout-config';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const EnvSchema = z.object({ NEXT_PUBLIC_FASTAPI_URL: z.string().url() });

const GenerateReportSchema = z.object({
  user_id: z.string().min(1).optional(),
  student_logs: z.array(z.any()).optional(),
  scenario_info: z
    .object({
      scenario: z.string(),
      description: z.string(),
    })
    .optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== 'production';

    const env = EnvSchema.safeParse({
      NEXT_PUBLIC_FASTAPI_URL: process.env.NEXT_PUBLIC_FASTAPI_URL,
    });

    if (!env.success) {
      logger.error('Environment configuration error', undefined, {
        error: 'NEXT_PUBLIC_FASTAPI_URL not configured',
      });

      if (isDev) {
        // 개발 모드에서는 더미 데이터 반환
        return NextResponse.json(
          {
            user_id: 'user_1234',
            report_text:
              '학생의 학습 패턴을 분석한 리포트입니다.\n\n- 평균 정답률: 65%\n- 가장 어려워하는 단원: 일차함수\n- 권장사항: 기초 개념 복습이 필요합니다.',
            weakest_unit: '일차함수',
            performance_summary: {
              total_problems: 10,
              correct_answers: 6,
              average_time: 180,
            },
            generated_at: new Date().toISOString(),
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        { success: false, error: 'LLM server URL not configured' },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = GenerateReportSchema.safeParse(body ?? {});

    if (!parsed.success) {
      logger.warn('Invalid generate report request', {
        errors: parsed.error.errors,
      });

      if (isDev) {
        return NextResponse.json(
          {
            user_id: 'user_1234',
            report_text:
              '학생의 학습 패턴을 분석한 리포트입니다.\n\n- 평균 정답률: 65%\n- 가장 어려워하는 단원: 일차함수\n- 권장사항: 기초 개념 복습이 필요합니다.',
            weakest_unit: '일차함수',
            performance_summary: {
              total_problems: 10,
              correct_answers: 6,
              average_time: 180,
            },
            generated_at: new Date().toISOString(),
          },
          { status: 200 },
        );
      }

      return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
    }

    const base = env.data.NEXT_PUBLIC_FASTAPI_URL.replace(/\/$/, '');
    const upstreamUrl = `${base}/generate-report`;

    const result = await RetryManager.executeWithRetry(async () => {
      const res = await fetchWithTimeout(
        upstreamUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.id && { 'x-user-id': session.user.id }),
          },
          body: JSON.stringify({
            user_id: parsed.data.user_id || 'demo_user',
            student_logs: parsed.data.student_logs || [],
            scenario_info: parsed.data.scenario_info,
          }),
        },
        AI_TIMEOUT_CONFIG.STUDENT_ANALYSIS,
      );

      if (!res.ok) {
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          const errJson = await res.json().catch(() => ({ detail: 'Upstream JSON parse error' }));
          throw new Error(`Upstream error: ${JSON.stringify(errJson)}`);
        }
        const text = await res.text().catch(() => '');
        throw new Error(`Upstream error: ${text || 'Unknown error'}`);
      }

      const json = await res.json().catch(() => ({}));
      return json;
    }, RetryManager.getAIServiceConfig());

    const duration = Date.now() - startTime;

    if (!result.success) {
      logger.error('Generate report bridge failed', result.error, {
        duration,
        attempts: result.attempts,
      });

      if (isDev) {
        // 학생 로그 데이터가 제공된 경우 더 상세한 더미 리포트 생성
        if (parsed.data.student_logs && parsed.data.student_logs.length > 0) {
          const logs = parsed.data.student_logs;
          const correctCount = logs.filter((log: any) => log.is_correct).length;
          const totalCount = logs.length;
          const avgTime = Math.round(
            logs.reduce((sum: number, log: any) => sum + (log.time_spent || 0), 0) / logs.length,
          );
          const mostFrequentUnit = getMostFrequentUnit(logs);

          return NextResponse.json(
            {
              user_id: parsed.data.user_id || 'demo_user',
              report_text: `학생의 학습 패턴 분석 리포트

📊 전체 성적
- 총 문제 수: ${totalCount}개
- 정답률: ${Math.round((correctCount * 100) / totalCount)}%
- 평균 풀이 시간: ${avgTime}초
- 시나리오: ${parsed.data.scenario_info?.description || '일반 학습자'}

🎯 주요 약점
- 가장 어려워하는 단원: ${mostFrequentUnit}
- 오답 문제 빈도가 높은 영역에서 추가 학습이 필요합니다.

💡 학습 권장사항
${avgTime > 200 ? '- 문제 풀이 시간이 다소 길어 시간 관리 연습이 필요합니다.' : ''}
${correctCount / totalCount < 0.5 ? '- 기초 개념 복습을 통해 정확도를 높이는 것이 중요합니다.' : '- 안정적인 학습 패턴을 유지하면서 어려운 문제에 도전하세요.'}

이 리포트는 제공된 학생 풀이 로그 데이터를 기반으로 생성되었습니다.`,
              weakest_unit: mostFrequentUnit,
              performance_summary: {
                total_problems: totalCount,
                correct_answers: correctCount,
                average_time: avgTime,
              },
              generated_at: new Date().toISOString(),
            },
            { status: 200 },
          );
        }

        return NextResponse.json(
          {
            user_id: 'user_1234',
            report_text:
              '학생의 학습 패턴을 분석한 리포트입니다.\n\n- 평균 정답률: 65%\n- 가장 어려워하는 단원: 일차함수\n- 권장사항: 기초 개념 복습이 필요합니다.',
            weakest_unit: '일차함수',
            performance_summary: {
              total_problems: 10,
              correct_answers: 6,
              average_time: 180,
            },
            generated_at: new Date().toISOString(),
          },
          { status: 200 },
        );
      }

      return NextResponse.json({ success: false, error: 'Upstream exception' }, { status: 500 });
    }

    logger.info('Generate report bridge completed', {
      duration,
      attempts: result.attempts,
      success: true,
    });

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error('Generate report bridge unexpected error', err, {
      duration,
    });

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        {
          user_id: 'user_1234',
          report_text:
            '학생의 학습 패턴을 분석한 리포트입니다.\n\n- 평균 정답률: 65%\n- 가장 어려워하는 단원: 일차함수\n- 권장사항: 기초 개념 복습이 필요합니다.',
          weakest_unit: '일차함수',
          performance_summary: {
            total_problems: 10,
            correct_answers: 6,
            average_time: 180,
          },
          generated_at: new Date().toISOString(),
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function getMostFrequentUnit(logs: any[]): string {
  const unitCounts: Record<string, number> = {};

  logs.forEach((log: any) => {
    if (log.unit) {
      unitCounts[log.unit] = (unitCounts[log.unit] || 0) + 1;
    }
  });

  return Object.entries(unitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '일차함수';
}
