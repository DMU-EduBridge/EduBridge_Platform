'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddMemberRequest } from '@/types/domain/class';
import { Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface InviteStudentModalProps {
  onInvite: (data: AddMemberRequest) => Promise<void>;
  isLoading?: boolean;
}

export function InviteStudentModal({ onInvite, isLoading }: InviteStudentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    role: 'STUDENT' as 'STUDENT' | 'ASSISTANT' | 'TEACHER',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: Record<string, string> = {};

    if (!formData.userId.trim()) {
      newErrors.userId = '사용자 ID를 입력해주세요';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await onInvite(formData);
      setIsOpen(false);
      setFormData({ userId: '', role: 'STUDENT' });
    } catch (error) {
      console.error('Invite error:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          멤버 초대
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>멤버 초대</DialogTitle>
          <DialogDescription>
            클래스에 새로운 멤버를 초대하세요. 사용자 ID를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">사용자 ID *</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) => handleChange('userId', e.target.value)}
              placeholder="사용자 ID를 입력하세요"
              className={errors.userId ? 'border-red-500' : ''}
            />
            {errors.userId && <p className="text-sm text-red-500">{errors.userId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">역할</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="STUDENT">학생</option>
              <option value="ASSISTANT">조교</option>
              <option value="TEACHER">교사</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              초대하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
