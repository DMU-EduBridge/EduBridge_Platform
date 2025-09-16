export interface ProblemSnapshot {
  id: string;
  subject?: string;
  difficulty?: string;
  isCorrect?: boolean;
}

export interface StudentSubjectPerformance {
  subject: string;
  attempts: number;
  correct: number;
}

export interface ReportAnalysisInput {
  problems?: ProblemSnapshot[];
  subjects?: StudentSubjectPerformance[];
  summary?: string;
}

export interface ReportAnalysisOutput {
  insights: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

// 간단한 규칙 기반 스텁. 실제 LLM 연동은 추후 추가(OpenAI/Anthropic)
export function generateAnalysisFromData(input: ReportAnalysisInput): ReportAnalysisOutput {
  const insights: string[] = [];
  const recommendations: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const problems = input.problems || [];
  const subjects = input.subjects || [];

  const total = problems.length;
  const correct = problems.filter((p) => p.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  insights.push(`전체 정답률은 ${accuracy}% 입니다.`);
  if (accuracy >= 80) strengths.push('전반적인 정답률이 우수합니다.');
  if (accuracy < 60) weaknesses.push('전반적인 정답률이 낮습니다. 기초 개념 보강이 필요합니다.');

  // 과목별 분석
  for (const s of subjects) {
    const subjectAccuracy = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
    insights.push(`${s.subject} 과목 정답률은 ${subjectAccuracy}% 입니다.`);
    if (subjectAccuracy >= 85) strengths.push(`${s.subject} 과목에서 강점을 보입니다.`);
    if (subjectAccuracy < 50) {
      weaknesses.push(`${s.subject} 과목 정답률이 낮습니다.`);
      recommendations.push(`${s.subject} 기초 문제를 중심으로 20~30문항 추가 학습을 권장합니다.`);
    }
  }

  // 난이도 기반 힌트
  const hardCount = problems.filter((p) => p.difficulty === 'HARD' && !p.isCorrect).length;
  if (hardCount >= 3)
    recommendations.push('어려운 난이도보다는 중간 난이도의 문제로 단계적 학습을 권장합니다.');

  if (recommendations.length === 0)
    recommendations.push('주당 2~3회 정기적인 복습 세션을 유지하세요.');

  return { insights, recommendations, strengths, weaknesses };
}

// OpenAI 사용 가능 시 LLM 호출, 실패 시 규칙 기반으로 폴백
export async function generateAnalysisSmart(
  input: ReportAnalysisInput,
): Promise<ReportAnalysisOutput> {
  try {
    if (process.env.OPENAI_API_KEY) {
      const prompt = buildPrompt(input);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                '너는 교육 데이터 분석가다. 학생의 문제 시도와 과목 성과를 바탕으로 한국어로 간결한 인사이트/개선제안/강점/약점을 JSON으로 제공한다.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          const parsed = safeParseJSON(text);
          if (parsed) {
            return normalizeOutput(parsed);
          }
        }
      }
    }
  } catch {
    // noop -> fallback
  }
  return generateAnalysisFromData(input);
}

function buildPrompt(input: ReportAnalysisInput): string {
  return [
    '아래는 학생의 문제 시도와 과목 성과 요약이다.',
    '결과를 다음 키를 가진 JSON으로만 출력하라: {"insights":[], "recommendations":[], "strengths":[], "weaknesses":[]}',
    '',
    `summary: ${input.summary || ''}`,
    `problems: ${JSON.stringify(input.problems || [])}`,
    `subjects: ${JSON.stringify(input.subjects || [])}`,
  ].join('\n');
}

function safeParseJSON(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeOutput(raw: any): ReportAnalysisOutput {
  const toArr = (v: any) => (Array.isArray(v) ? v.map((x) => String(x)) : []);
  return {
    insights: toArr(raw.insights),
    recommendations: toArr(raw.recommendations),
    strengths: toArr(raw.strengths),
    weaknesses: toArr(raw.weaknesses),
  };
}
