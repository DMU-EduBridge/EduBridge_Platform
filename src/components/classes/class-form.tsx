'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClassWithStats, CreateClassRequest } from '@/types/domain/class';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ClassFormProps {
  initialData?: ClassWithStats;
  onSubmit: (data: CreateClassRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClassForm({ initialData, onSubmit, onCancel, isLoading }: ClassFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    subject: initialData?.subject || '',
    gradeLevel: initialData?.gradeLevel || '',
    schoolYear: initialData?.schoolYear || new Date().getFullYear().toString(),
    semester: initialData?.semester || '1학기',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '클래스명을 입력해주세요';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = '과목을 입력해주세요';
    }
    if (!formData.gradeLevel.trim()) {
      newErrors.gradeLevel = '학년을 입력해주세요';
    }
    if (!formData.schoolYear.trim()) {
      newErrors.schoolYear = '학년도를 입력해주세요';
    }
    if (!formData.semester.trim()) {
      newErrors.semester = '학기를 선택해주세요';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? '클래스 수정' : '새 클래스 생성'}</CardTitle>
        <CardDescription>
          {initialData ? '클래스 정보를 수정하세요' : '새로운 클래스를 생성하세요'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">클래스명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="예: 중1 수학 A반"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="클래스에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">과목 *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="예: 수학"
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">학년 *</Label>
              <Input
                id="gradeLevel"
                value={formData.gradeLevel}
                onChange={(e) => handleChange('gradeLevel', e.target.value)}
                placeholder="예: 중1"
                className={errors.gradeLevel ? 'border-red-500' : ''}
              />
              {errors.gradeLevel && <p className="text-sm text-red-500">{errors.gradeLevel}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolYear">학년도 *</Label>
              <Input
                id="schoolYear"
                value={formData.schoolYear}
                onChange={(e) => handleChange('schoolYear', e.target.value)}
                placeholder="예: 2024"
                className={errors.schoolYear ? 'border-red-500' : ''}
              />
              {errors.schoolYear && <p className="text-sm text-red-500">{errors.schoolYear}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">학기 *</Label>
              <select
                id="semester"
                value={formData.semester}
                onChange={(e) => handleChange('semester', e.target.value)}
                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
                  errors.semester ? 'border-red-500' : ''
                }`}
              >
                <option value="">학기 선택</option>
                <option value="1학기">1학기</option>
                <option value="2학기">2학기</option>
                <option value="여름방학">여름방학</option>
                <option value="겨울방학">겨울방학</option>
              </select>
              {errors.semester && <p className="text-sm text-red-500">{errors.semester}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? '수정하기' : '생성하기'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
