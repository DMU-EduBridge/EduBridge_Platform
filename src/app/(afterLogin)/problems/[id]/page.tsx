import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
import SolveClient, { ProblemViewModel } from './solve-client';

export default async function ProblemDetailPage({ params }: { params: { id: string } }) {
  const problem = await prisma.problem.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      options: true,
      correctAnswer: true,
      explanation: true,
      hints: true,
    },
  });

  if (!problem) {
    return null;
  }

  const vm: ProblemViewModel = {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    type: problem.type,
    options: parseJsonArray(problem.options),
    correctAnswer: problem.correctAnswer,
    explanation: problem.explanation ?? null,
    hints: parseJsonArray(problem.hints),
  };

  return <SolveClient problem={vm} />;
}
