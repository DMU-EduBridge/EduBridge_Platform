'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface Student {
  id: number;
  name: string;
  math: number;
  korean: number;
  english: number;
  assignment_rate: number;
}

interface ClassInfo {
  grade: number;
  class: number;
  subject: string;
  teacher: string;
}

interface ReportResult {
  success: boolean;
  report: string;
  analysis: any;
  metadata: any;
}

export function TeacherReportCard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo>({
    grade: 2,
    class: 1,
    subject: '전체과목',
    teacher: '홍길동',
  });
  const [reportType, setReportType] = useState<'full' | 'summary'>('full');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    math: 0,
    korean: 0,
    english: 0,
    assignment_rate: 0,
  });

  const generateSampleData = async (
    sampleType: 'normal' | 'struggling' | 'high_achieving' = 'normal',
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/teacher-report', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sample_type: sampleType,
          num_students: 30,
          subjects: ['math', 'korean', 'english'],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
        setClassInfo(data.class_info);
      } else {
        setError(data.error || '샘플 데이터 생성 실패');
      }
    } catch (error) {
      setError('샘플 데이터 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (students.length === 0) {
      setError('학생 데이터를 먼저 입력하거나 샘플 데이터를 생성해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/teacher-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students,
          class_info: classInfo,
          report_type: reportType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReportResult(data);
      } else {
        setError(data.error || '리포트 생성 실패');
      }
    } catch (error) {
      setError('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = () => {
    if (!newStudent.name) {
      setError('학생 이름을 입력해주세요.');
      return;
    }

    const student: Student = {
      id: students.length + 1,
      name: newStudent.name,
      math: newStudent.math || 0,
      korean: newStudent.korean || 0,
      english: newStudent.english || 0,
      assignment_rate: newStudent.assignment_rate || 0,
    };

    setStudents([...students, student]);
    setNewStudent({
      name: '',
      math: 0,
      korean: 0,
      english: 0,
      assignment_rate: 0,
    });
    setError('');
  };

  const removeStudent = (id: number) => {
    setStudents(students.filter((student) => student.id !== id));
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">우수</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">양호</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">보통</Badge>;
    return <Badge className="bg-red-100 text-red-800">미흡</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* 메인 리포트 생성 카드 */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI 교사 리포트 생성
          </CardTitle>
          <CardDescription>
            학생 성적 데이터를 분석하여 AI가 자동으로 교사 리포트를 생성합니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 샘플 데이터 생성 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">샘플 데이터 생성</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => generateSampleData('normal')}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <Users className="mr-2 h-4 w-4" />
                  일반 클래스
                </Button>
                <Button
                  onClick={() => generateSampleData('high_achieving')}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  우수 클래스
                </Button>
                <Button
                  onClick={() => generateSampleData('struggling')}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  부진 클래스
                </Button>
              </div>
            </div>
          </div>

          {/* 학급 정보 설정 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">학년</Label>
              <Input
                id="grade"
                type="number"
                value={classInfo.grade}
                onChange={(e) =>
                  setClassInfo((prev) => ({ ...prev, grade: parseInt(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">반</Label>
              <Input
                id="class"
                type="number"
                value={classInfo.class}
                onChange={(e) =>
                  setClassInfo((prev) => ({ ...prev, class: parseInt(e.target.value) || 1 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">과목</Label>
              <Input
                id="subject"
                value={classInfo.subject}
                onChange={(e) => setClassInfo((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">교사명</Label>
              <Input
                id="teacher"
                value={classInfo.teacher}
                onChange={(e) => setClassInfo((prev) => ({ ...prev, teacher: e.target.value }))}
              />
            </div>
          </div>

          {/* 리포트 타입 선택 */}
          <div className="space-y-2">
            <Label>리포트 타입</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="full"
                  checked={reportType === 'full'}
                  onChange={(e) => setReportType(e.target.value as 'full' | 'summary')}
                />
                <span>상세 리포트</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="summary"
                  checked={reportType === 'summary'}
                  onChange={(e) => setReportType(e.target.value as 'full' | 'summary')}
                />
                <span>요약 리포트</span>
              </label>
            </div>
          </div>

          {/* 리포트 생성 버튼 */}
          <Button
            onClick={generateReport}
            disabled={isLoading || students.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            AI 리포트 생성
          </Button>
        </CardContent>
      </Card>

      {/* 학생 데이터 입력 카드 */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            학생 데이터 관리 ({students.length}명)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 새 학생 추가 */}
          <div className="grid grid-cols-6 items-end gap-2">
            <div>
              <Label htmlFor="studentName">이름</Label>
              <Input
                id="studentName"
                placeholder="학생 이름"
                value={newStudent.name}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="math">수학</Label>
              <Input
                id="math"
                type="number"
                min="0"
                max="100"
                value={newStudent.math}
                onChange={(e) =>
                  setNewStudent((prev) => ({ ...prev, math: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label htmlFor="korean">국어</Label>
              <Input
                id="korean"
                type="number"
                min="0"
                max="100"
                value={newStudent.korean}
                onChange={(e) =>
                  setNewStudent((prev) => ({ ...prev, korean: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label htmlFor="english">영어</Label>
              <Input
                id="english"
                type="number"
                min="0"
                max="100"
                value={newStudent.english}
                onChange={(e) =>
                  setNewStudent((prev) => ({ ...prev, english: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label htmlFor="assignment">과제율</Label>
              <Input
                id="assignment"
                type="number"
                min="0"
                max="100"
                value={newStudent.assignment_rate}
                onChange={(e) =>
                  setNewStudent((prev) => ({
                    ...prev,
                    assignment_rate: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <Button onClick={addStudent} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 학생 목록 */}
          {students.length > 0 && (
            <div className="space-y-2">
              <Label>학생 목록</Label>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{student.name}</div>
                      <div className="flex gap-2 text-sm">
                        <span className={getGradeColor(student.math)}>수학: {student.math}</span>
                        <span className={getGradeColor(student.korean)}>
                          국어: {student.korean}
                        </span>
                        <span className={getGradeColor(student.english)}>
                          영어: {student.english}
                        </span>
                        <span>과제: {student.assignment_rate}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getGradeBadge(
                        Math.round((student.math + student.korean + student.english) / 3),
                      )}
                      <Button onClick={() => removeStudent(student.id)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 리포트 결과 카드 */}
      {reportResult && (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              생성된 리포트
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4">
                {reportResult.report}
              </div>
            </div>

            {reportResult.analysis && (
              <div className="space-y-2">
                <Label>분석 결과</Label>
                <div className="rounded-lg bg-blue-50 p-4">
                  <pre className="text-sm">{JSON.stringify(reportResult.analysis, null, 2)}</pre>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                리포트 다운로드
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 생성
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 오류 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
