'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LLMProblemDifficulty,
  LLMProblemGenerationRequest,
  LLMProblemGenerationResponse,
  LLMProblemSubject,
  convertLLMProblemToInternal,
  getLLMDifficultyConfig,
  getSubjectConfig,
} from '@/types/domain/problem';
import { Bot, Loader2, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ProblemGenerationFormProps {
  onGenerate: (request: LLMProblemGenerationRequest) => Promise<LLMProblemGenerationResponse>;
  onSaveProblems: (problems: any[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ProblemGenerationForm({
  onGenerate,
  onSaveProblems,
  isLoading = false,
}: ProblemGenerationFormProps) {
  const [formData, setFormData] = useState<LLMProblemGenerationRequest>({
    subject: 'MATH',
    unit: '',
    difficulty: 'MEDIUM' as LLMProblemDifficulty,
    count: 5,
    question_type: 'MULTIPLE_CHOICE',
  });

  const [generatedProblems, setGeneratedProblems] = useState<LLMProblemGenerationResponse | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await onGenerate(formData);
      setGeneratedProblems(response);
    } catch (error) {
      console.error('문제 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProblems = async () => {
    if (!generatedProblems) return;

    setIsSaving(true);
    try {
      const internalProblems = generatedProblems.questions.map(convertLLMProblemToInternal);
      await onSaveProblems(internalProblems);
      setGeneratedProblems(null);
    } catch (error) {
      console.error('문제 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const subjects: LLMProblemSubject[] = [
    'MATH',
    'SCIENCE',
    'KOREAN',
    'ENGLISH',
    'SOCIAL_STUDIES',
    'HISTORY',
    'GEOGRAPHY',
    'PHYSICS',
    'CHEMISTRY',
    'BIOLOGY',
    'EARTH_SCIENCE',
  ];

  const difficulties: LLMProblemDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <div className="space-y-6 p-6">
      {/* 생성 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI 문제 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">과목</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subject: value as LLMProblemSubject }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => {
                    const config = getSubjectConfig(subject);
                    return (
                      <SelectItem key={subject} value={subject}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${config.color.split(' ')[0]}`} />
                          {subject}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">난이도</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, difficulty: value as LLMProblemDifficulty }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => {
                    const config = getLLMDifficultyConfig(difficulty);
                    return (
                      <SelectItem key={difficulty} value={difficulty}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${config.color.split(' ')[0]}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">단원 (선택사항)</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="예: 일차함수, 물질의 상태변화"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">생성할 문제 수</Label>
              <Select
                value={formData.count.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, count: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 10].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count}개
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isLoading}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
              {isGenerating ? '생성 중...' : '문제 생성'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 생성된 문제 미리보기 */}
      {generatedProblems && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>생성된 문제 ({generatedProblems.total_questions}개)</span>
              <Button
                onClick={handleSaveProblems}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isSaving ? '저장 중...' : '모두 저장'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedProblems.questions.map((problem, index) => {
                const subjectConfig = getSubjectConfig(problem.subject);
                const difficultyConfig = getLLMDifficultyConfig(problem.difficulty);

                return (
                  <div key={problem.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">문제 {index + 1}</span>
                      <div className={`rounded px-2 py-1 text-xs ${subjectConfig.color}`}>
                        {problem.subject}
                      </div>
                      <div className={`rounded px-2 py-1 text-xs ${difficultyConfig.color}`}>
                        {difficultyConfig.label}
                      </div>
                      {problem.unit && (
                        <span className="text-xs text-gray-500">• {problem.unit}</span>
                      )}
                    </div>

                    <h4 className="mb-3 font-medium text-gray-900">{problem.question}</h4>

                    <div className="mb-3 space-y-2">
                      {problem.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`rounded p-2 text-sm ${
                            optionIndex === problem.correct_answer
                              ? 'border border-green-200 bg-green-50 text-green-800'
                              : 'border border-gray-200 bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>{' '}
                          {option}
                          {optionIndex === problem.correct_answer && (
                            <span className="ml-2 text-xs font-medium">✓ 정답</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">해설:</span>
                        <p className="text-gray-600">{problem.explanation}</p>
                      </div>
                      {problem.hint && (
                        <div>
                          <span className="font-medium text-gray-700">힌트:</span>
                          <p className="text-gray-600">{problem.hint}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
