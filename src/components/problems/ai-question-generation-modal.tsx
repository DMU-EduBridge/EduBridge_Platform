'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAIQuestionGeneration } from '@/hooks/ai-question-generation/use-ai-question-generation';
import { QuestionGenerationRequest } from '@/types/ai-question-generation';
import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AIQuestionGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsGenerated?: (questions: any[]) => void;
}

const SUBJECTS = ['수학', '영어', '과학', '사회', '국어', '역사', '지리', '물리', '화학', '생물'];

const DIFFICULTIES = [
  { value: 'easy', label: '쉬움' },
  { value: 'medium', label: '보통' },
  { value: 'hard', label: '어려움' },
];

export function AIQuestionGenerationModal({
  open,
  onOpenChange,
  onQuestionsGenerated,
}: AIQuestionGenerationModalProps) {
  const [formData, setFormData] = useState<QuestionGenerationRequest>({
    subject: '수학',
    unit: '',
    difficulty: 'medium',
    count: 1,
  });

  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { generateQuestions, saveQuestions } = useAIQuestionGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.unit) {
      toast.error('필수 항목을 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateQuestions.mutateAsync(formData);

      if (result.success && result.data.length > 0) {
        setGeneratedQuestions(result.data);
        onQuestionsGenerated?.(result.data);
        toast.success(`${result.data.length}개의 문제가 생성되었습니다.`);
      } else {
        toast.error('문제 생성에 실패했습니다.', {
          description: result.error || '알 수 없는 오류가 발생했습니다.',
        });
      }
    } catch (error: any) {
      toast.error('문제 생성 중 오류가 발생했습니다.', {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (generatedQuestions.length === 0) {
      toast.error('저장할 문제가 없습니다.');
      return;
    }

    try {
      await saveQuestions.mutateAsync({
        questions: generatedQuestions,
        createdBy: 'current-user-id', // TODO: 실제 사용자 ID로 교체
      });

      onOpenChange(false);
      setGeneratedQuestions([]);
      setFormData({
        subject: '수학',
        unit: '',
        difficulty: 'medium',
        count: 1,
      });
    } catch (error: any) {
      toast.error('문제 저장 중 오류가 발생했습니다.', {
        description: error.message,
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setGeneratedQuestions([]);
    setFormData({
      subject: '수학',
      unit: '',
      difficulty: 'medium',
      count: 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI 문제 생성
          </DialogTitle>
          <DialogDescription>
            AI를 활용하여 새로운 문제를 생성합니다. 과목과 단원을 입력하면 자동으로 문제가
            생성됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">과목 *</Label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">난이도</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">단원 *</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="예: 일차함수, 삼각함수, 확률과 통계"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">생성할 문제 수</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="10"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
              className="w-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || generateQuestions.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating || generateQuestions.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  문제 생성
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* 생성된 문제 미리보기 */}
        {generatedQuestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">생성된 문제 ({generatedQuestions.length}개)</h3>
              <Button
                onClick={handleSaveQuestions}
                disabled={saveQuestions.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {saveQuestions.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '문제 저장'
                )}
              </Button>
            </div>

            <div className="max-h-60 space-y-3 overflow-y-auto">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="rounded-lg border bg-gray-50 p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-sm font-medium">{question.title}</h4>
                    <span className="rounded bg-white px-2 py-1 text-xs text-gray-500">
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-gray-700">{question.content}</p>
                  {question.options && (
                    <div className="text-xs text-gray-600">
                      선택지: {question.options.join(', ')}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-green-600">정답: {question.correctAnswer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
