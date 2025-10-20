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
import { Textarea } from '@/components/ui/textarea';
import { useStudentMutations } from '@/hooks/students/use-student-mutations';
import { useState } from 'react';
import { toast } from 'sonner';

interface StudentInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentInviteModal({ open, onOpenChange }: StudentInviteModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [message, setMessage] = useState('');

  const { inviteStudent } = useStudentMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteStudent.mutateAsync({ name, email, gradeLevel, message });
      toast.success('학생이 성공적으로 연결되었습니다.');
      onOpenChange(false);
      setName('');
      setEmail('');
      setGradeLevel('');
      setMessage('');
    } catch (error: any) {
      const errorData = error?.response?.data || error;
      const errorMessage = errorData?.error || error.message || '학생 연결 중 오류가 발생했습니다.';
      const suggestion = errorData?.suggestion;

      toast.error('학생 연결 실패', {
        description: suggestion ? `${errorMessage}\n\n${suggestion}` : errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>학생 연결</DialogTitle>
          <DialogDescription>
            이미 가입된 학생을 내 클래스에 연결합니다.
            <br />
            <span className="text-sm text-muted-foreground">
              학생이 먼저 회원가입을 완료해야 합니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              이름
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gradeLevel" className="text-right">
              학년
            </Label>
            <select
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">학년 선택</option>
              <option value="GRADE_7">중학교 1학년</option>
              <option value="GRADE_8">중학교 2학년</option>
              <option value="GRADE_9">중학교 3학년</option>
              <option value="GRADE_10">고등학교 1학년</option>
              <option value="GRADE_11">고등학교 2학년</option>
              <option value="GRADE_12">고등학교 3학년</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              메시지 (선택)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={inviteStudent.isPending}>
              {inviteStudent.isPending ? '연결 중...' : '학생 연결'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
