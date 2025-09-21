import { AIStatsService } from './services/ai-stats.service';
import { DocumentChunkService } from './services/document-chunk.service';
import { ProblemService } from './services/problem.service';
import { SearchService } from './services/search.service';
import { TeacherReportService } from './services/teacher-report.service';
import { TextbookService } from './services/textbook.service';
import { UserService } from './services/user.service';

// Service 인스턴스들 (직접 인스턴스 생성)
export const userService = new UserService();
export const problemService = new ProblemService();
export const textbookService = new TextbookService();
export const teacherReportService = new TeacherReportService();
export const documentChunkService = new DocumentChunkService();
export const searchService = new SearchService();
export const aiStatsService = new AIStatsService();

// 기존 problemService와의 호환성을 위한 export
export { problemService as default };
