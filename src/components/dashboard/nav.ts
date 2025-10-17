import {
  BookOpen,
  Bot,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MessageSquare,
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
    { name: '할 일 목록', href: '/my/todos', icon: CheckSquare },
    { name: '메시지', href: '/my/messages', icon: Mail },
    { name: 'AI 어시스턴트', href: '/ai-assistant', icon: MessageSquare },
    { name: '오답 노트', href: '/my/incorrect-answers', icon: FileText },
    { name: '내 리포트', href: '/my/reports', icon: Calendar },
    { name: '프로필', href: '/profile', icon: User },
  ];
}

export function getTeacherNav(): NavItem[] {
  return [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '내 클래스', href: '/classes', icon: GraduationCap },
    { name: '학생 관리', href: '/students', icon: Users },
    { name: '문제', href: '/problems', icon: FileText },
    { name: '학습 관리', href: '/learning-materials', icon: FolderOpen },
    { name: '분석 리포트', href: '/reports', icon: Calendar },
    { name: 'AI 교사 리포트', href: '/teacher-reports', icon: Bot },
    // 학생 기능들도 교사가 사용할 수 있도록 추가
    { name: '할 일 목록', href: '/my/todos', icon: CheckSquare },
    { name: '메시지', href: '/my/messages', icon: Mail },
    { name: 'AI 어시스턴트', href: '/ai-assistant', icon: MessageSquare },
    { name: '오답 노트', href: '/my/incorrect-answers', icon: FileText },
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
