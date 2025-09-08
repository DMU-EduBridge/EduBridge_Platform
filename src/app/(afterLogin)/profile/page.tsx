"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Save,
  Edit,
  Camera,
  Award,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "김선생",
    email: "teacher.kim@school.edu",
    phone: "010-1234-5678",
    school: "서울고등학교",
    department: "수학과",
    experience: "15년",
    subjects: ["수학", "통계학"],
    bio: "15년간 수학 교육에 종사하며, 학생들의 수학적 사고력 향상에 중점을 두고 있습니다. AI 기술을 활용한 개인화된 학습 환경 구축에 관심이 많습니다.",
    location: "서울특별시 강남구",
    joinDate: "2024-01-01",
  });

  const handleSave = () => {
    setIsEditing(false);
    // 실제로는 API 호출로 프로필 업데이트
  };

  const stats = [
    { label: "총 학생 수", value: "45", icon: Users },
    { label: "생성한 문제", value: "128", icon: BookOpen },
    { label: "평균 성취율", value: "87%", icon: TrendingUp },
    { label: "교육 경력", value: "15년", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
          <p className="text-gray-600 mt-2">개인 정보를 관리하고 계정 설정을 변경하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? "취소" : "편집"}
          </Button>
          {isEditing && (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로필 카드 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  김
                </div>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  variant="outline"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{profile.name}</CardTitle>
              <CardDescription>
                {profile.school} • {profile.department}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>가입일: {profile.joinDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>경력: {profile.experience}</span>
                </div>
              </div>

              {/* 담당 과목 */}
              <div>
                <Label className="text-sm font-medium">담당 과목</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 개인 정보 편집 */}
          <Card>
            <CardHeader>
              <CardTitle>개인 정보</CardTitle>
              <CardDescription>기본 정보를 수정하고 프로필을 업데이트하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="school">학교</Label>
                  <Input
                    id="school"
                    value={profile.school}
                    onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="department">학과</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="location">위치</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">자기소개</Label>
                <textarea
                  id="bio"
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* 계정 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>계정 설정</CardTitle>
              <CardDescription>보안 및 알림 설정을 관리하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">비밀번호 변경</h4>
                  <p className="text-sm text-gray-600">정기적으로 비밀번호를 변경하세요</p>
                </div>
                <Button variant="outline" size="sm">
                  변경하기
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">이메일 알림</h4>
                  <p className="text-sm text-gray-600">학생 활동 및 시스템 알림을 받습니다</p>
                </div>
                <Button variant="outline" size="sm">
                  설정
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">데이터 내보내기</h4>
                  <p className="text-sm text-gray-600">계정 데이터를 다운로드하세요</p>
                </div>
                <Button variant="outline" size="sm">
                  내보내기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
