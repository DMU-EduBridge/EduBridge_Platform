// import { AnalyticsService } from './services/analytics.service'; // 파일이 존재하지 않음
import { ChatbotService } from './services/chatbot.service';
import { ProblemService } from './services/problem';
import { ProblemStatsService } from './services/problem/problem-stats.service';
import { userService } from './services/user';

// Service 인스턴스들 (직접 인스턴스 생성)
export { userService };
export const problemService = new ProblemService();
export const chatbotService = new ChatbotService();
// export const analytics = new AnalyticsService(); // 서비스가 존재하지 않음
export const problemStatsService = new ProblemStatsService();

// 대시보드 API용 서비스들 (시뮬레이션 모드)
export const aiStatsService = {
  getAIStatsSummary: () => ({
    totalApiCalls: 0,
    totalCostUsd: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0,
    successRate: 100,
    topApiTypes: [],
  }),
};

export const textbookService = {
  getTextbookStats: () => ({
    totalTextbooks: 0,
    bySubject: {},
    byGradeLevel: {},
    byStatus: {},
  }),
};

export const teacherReportService = {
  getTeacherReportStats: () => ({
    totalReports: 0,
    byStatus: {},
    byAnalysisType: {},
  }),
};

export const searchService = {
  getSearchStats: () => ({
    totalQueries: 0,
    averageSearchTime: 0,
    topSubjects: [],
  }),
};

// 기존 problemService와의 호환성을 위한 export
export { problemService as default };
