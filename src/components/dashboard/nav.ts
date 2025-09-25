import {
  BookOpen,
  Bot,
  Calendar,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';

export type NavItem = { name: string; href: string; icon: any };

export function getStudentNav(): NavItem[] {
  return [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '나의 학습', href: '/my/learning', icon: BookOpen },
    { name: '내 리포트', href: '/my/reports', icon: Calendar },
    { name: '프로필', href: '/profile', icon: User },
  ];
}

export function getTeacherNav(): NavItem[] {
  return [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '문제', href: '/problems', icon: FileText },
    { name: '학습 관리', href: '/learning-materials', icon: FolderOpen },
    { name: '학생 관리', href: '/students', icon: Users },
    { name: '분석 리포트', href: '/reports', icon: Calendar },
    { name: 'AI 교사 리포트', href: '/teacher-reports', icon: Bot },
    { name: '의미적 검색', href: '/vector-search', icon: Search },
    { name: '프로필', href: '/profile', icon: User },
  ];
}

export function getAdminNav(): NavItem[] {
  return [
    { name: '관리자 대시보드', href: '/admin', icon: Shield },
    { name: '사용자 관리', href: '/admin/users', icon: Users },
    { name: '시스템 설정', href: '/admin/settings', icon: Settings },
  ];
}
