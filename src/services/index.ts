// 서비스 레이어 통합 export
export {
  attemptService,
  type Attempt,
  type AttemptsResponse,
  type CreateAttemptRequest,
  type CreateAttemptResponse,
} from './attempt.service';
export {
  learningService,
  type LearningAttempt,
  type LearningStatus,
  type LearningStatusResponse,
} from './learning.service';
export { progressService, type ProgressData, type ProgressResponse } from './progress.service';
