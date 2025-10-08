import { logger } from '@/lib/monitoring';
import { ok, withAuth } from '@/server/http/handler';
import { dashboardOverviewService } from '@/server/services/dashboard/overview.service';

interface DashboardOverview {
  learningProgress: {
    id: string;
    subject: string;
    grade: string;
    gradeColor: 'green' | 'red';
    currentUnit: string;
    progress: number;
    totalProblems: number;
    completedProblems: number;
    lastStudiedAt: string;
  }[];
  todos: {
    id: string;
    text: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  messages: {
    id: string;
    sender: string;
    senderId: string;
    message: string;
    hasNotification: boolean;
    notificationCount?: number;
    isRead: boolean;
    messageType: 'question' | 'announcement' | 'reminder' | 'general';
    createdAt: string;
  }[];
  aiChatExamples: {
    id: string;
    prompt: string;
    response: string;
    date: string;
    messageType: 'question' | 'translation' | 'explanation' | 'general';
    subject?: string;
  }[];
  incorrectAnswerNotes: {
    id: string;
    subject: string;
    grade: string;
    gradeColor: 'green' | 'red';
    status: string;
    statusColor: 'red' | 'yellow' | 'green';
    incorrectCount: number;
    retryCount: number;
    completedCount: number;
    totalProblems: number;
    lastUpdated: string;
  }[];
  summary: {
    totalSubjects: number;
    totalTodos: number;
    completedTodos: number;
    unreadMessages: number;
    totalIncorrectProblems: number;
    completedIncorrectProblems: number;
  };
}

export async function GET() {
  return withAuth(async ({ userId }) => {
    const data = (await dashboardOverviewService.getOverview(userId)) as DashboardOverview;
    logger.info('대시보드 개요 조회 성공', { userId, summary: data.summary });
    return new Response(JSON.stringify(ok(data)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
