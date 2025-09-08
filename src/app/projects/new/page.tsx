"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewLearningMaterialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "MEDIUM",
    estimatedTime: "",
    content: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      url: string;
      filename: string;
      size: number;
      type: string;
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (file: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }) => {
    setUploadedFiles((prev) => [...prev, file]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 실제 API 호출로 대체
      const response = await fetch("/api/learning-materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          files: uploadedFiles,
          status: "DRAFT",
        }),
      });

      if (response.ok) {
        router.push("/projects");
      } else {
        throw new Error("Failed to create learning material");
      }
    } catch (error) {
      console.error("Error creating learning material:", error);
      alert("학습 자료 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">새 학습 자료</h1>
          <p className="text-gray-600 mt-2">학생들을 위한 새로운 학습 자료를 생성하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>학습 자료의 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="학습 자료 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="학습 자료에 대한 간단한 설명을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subject">과목 *</Label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">과목 선택</option>
                  <option value="수학">수학</option>
                  <option value="국어">국어</option>
                  <option value="영어">영어</option>
                  <option value="과학">과학</option>
                  <option value="사회">사회</option>
                  <option value="역사">역사</option>
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">난이도</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EASY">쉬움</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HARD">어려움</option>
                  <option value="EXPERT">전문가</option>
                </select>
              </div>

              <div>
                <Label htmlFor="estimatedTime">예상 학습 시간 (분)</Label>
                <Input
                  id="estimatedTime"
                  name="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  placeholder="60"
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 파일 업로드 */}
        <Card>
          <CardHeader>
            <CardTitle>첨부 파일</CardTitle>
            <CardDescription>학습 자료에 필요한 파일들을 업로드하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={handleFileUpload}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
              maxSize={50}
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">업로드된 파일</h4>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-600">{file.filename}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 학습 내용 */}
        <Card>
          <CardHeader>
            <CardTitle>학습 내용</CardTitle>
            <CardDescription>학습 자료의 상세 내용을 작성하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="학습 내용을 상세히 작성하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={10}
            />
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/projects">취소</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
