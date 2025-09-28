export const progressKeys = {
  all: ['progress'] as const,
  study: (studyId: string) => [...progressKeys.all, 'study', studyId] as const,
  problem: (studyId: string, problemId: string) =>
    [...progressKeys.study(studyId), 'problem', problemId] as const,
  learningStatus: (studyId: string) => [...progressKeys.study(studyId), 'learningStatus'] as const,
  attempts: (studyId: string) => [...progressKeys.study(studyId), 'attempts'] as const,
} as const;
