import { AnalyticsService } from './services/analytics.service';
import { ChatbotService } from './services/chatbot.service';
import { ProblemService } from './services/problem';
import { userService } from './services/user';

// Service 인스턴스들 (직접 인스턴스 생성)
export { userService };
export const problemService = new ProblemService();
export const chatbotService = new ChatbotService();
export const analytics = new AnalyticsService();

// 기존 problemService와의 호환성을 위한 export
export { problemService as default };
