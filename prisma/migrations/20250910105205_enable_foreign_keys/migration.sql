-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ai_generations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "cost" REAL,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_generations_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ai_generations" ("cost", "createdAt", "duration", "id", "modelId", "prompt", "response", "tokensUsed") SELECT "cost", "createdAt", "duration", "id", "modelId", "prompt", "response", "tokensUsed" FROM "ai_generations";
DROP TABLE "ai_generations";
ALTER TABLE "new_ai_generations" RENAME TO "ai_generations";
CREATE INDEX "ai_generations_modelId_idx" ON "ai_generations"("modelId");
CREATE INDEX "ai_generations_createdAt_idx" ON "ai_generations"("createdAt");
CREATE TABLE "new_analysis_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "insights" TEXT,
    "recommendations" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "aiGenerationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "analysis_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "analysis_reports_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_generations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_analysis_reports" ("aiGenerationId", "createdAt", "deletedAt", "id", "insights", "period", "recommendations", "status", "strengths", "studentId", "title", "type", "weaknesses") SELECT "aiGenerationId", "createdAt", "deletedAt", "id", "insights", "period", "recommendations", "status", "strengths", "studentId", "title", "type", "weaknesses" FROM "analysis_reports";
DROP TABLE "analysis_reports";
ALTER TABLE "new_analysis_reports" RENAME TO "analysis_reports";
CREATE INDEX "analysis_reports_studentId_idx" ON "analysis_reports"("studentId");
CREATE INDEX "analysis_reports_type_idx" ON "analysis_reports"("type");
CREATE INDEX "analysis_reports_status_idx" ON "analysis_reports"("status");
CREATE INDEX "analysis_reports_createdAt_idx" ON "analysis_reports"("createdAt");
CREATE INDEX "analysis_reports_aiGenerationId_idx" ON "analysis_reports"("aiGenerationId");
CREATE INDEX "analysis_reports_deletedAt_idx" ON "analysis_reports"("deletedAt");
CREATE TABLE "new_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "selected" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_attempts" ("createdAt", "id", "isCorrect", "problemId", "selected", "userId") SELECT "createdAt", "id", "isCorrect", "problemId", "selected", "userId" FROM "attempts";
DROP TABLE "attempts";
ALTER TABLE "new_attempts" RENAME TO "attempts";
CREATE INDEX "attempts_userId_problemId_idx" ON "attempts"("userId", "problemId");
CREATE TABLE "new_career_counseling" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "careerSuggestions" TEXT,
    "universityRecommendations" TEXT,
    "skillGaps" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "aiGenerationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "career_counseling_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "career_counseling_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_generations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_career_counseling" ("aiGenerationId", "careerSuggestions", "content", "createdAt", "deletedAt", "id", "skillGaps", "status", "studentId", "title", "type", "universityRecommendations") SELECT "aiGenerationId", "careerSuggestions", "content", "createdAt", "deletedAt", "id", "skillGaps", "status", "studentId", "title", "type", "universityRecommendations" FROM "career_counseling";
DROP TABLE "career_counseling";
ALTER TABLE "new_career_counseling" RENAME TO "career_counseling";
CREATE INDEX "career_counseling_studentId_idx" ON "career_counseling"("studentId");
CREATE INDEX "career_counseling_type_idx" ON "career_counseling"("type");
CREATE INDEX "career_counseling_status_idx" ON "career_counseling"("status");
CREATE INDEX "career_counseling_aiGenerationId_idx" ON "career_counseling"("aiGenerationId");
CREATE INDEX "career_counseling_deletedAt_idx" ON "career_counseling"("deletedAt");
CREATE TABLE "new_learning_material_problems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learningMaterialId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_material_problems_learningMaterialId_fkey" FOREIGN KEY ("learningMaterialId") REFERENCES "learning_materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "learning_material_problems_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_learning_material_problems" ("createdAt", "id", "learningMaterialId", "problemId") SELECT "createdAt", "id", "learningMaterialId", "problemId" FROM "learning_material_problems";
DROP TABLE "learning_material_problems";
ALTER TABLE "new_learning_material_problems" RENAME TO "learning_material_problems";
CREATE INDEX "learning_material_problems_learningMaterialId_idx" ON "learning_material_problems"("learningMaterialId");
CREATE INDEX "learning_material_problems_problemId_idx" ON "learning_material_problems"("problemId");
CREATE UNIQUE INDEX "learning_material_problems_learningMaterialId_problemId_key" ON "learning_material_problems"("learningMaterialId", "problemId");
CREATE TABLE "new_problems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "hints" TEXT,
    "tags" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "timeLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerationId" TEXT,
    "qualityScore" REAL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "problems_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_generations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_problems" ("aiGenerationId", "content", "correctAnswer", "createdAt", "deletedAt", "description", "difficulty", "explanation", "hints", "id", "isAIGenerated", "isActive", "options", "points", "qualityScore", "reviewStatus", "reviewedAt", "reviewedBy", "subject", "tags", "timeLimit", "title", "type", "updatedAt") SELECT "aiGenerationId", "content", "correctAnswer", "createdAt", "deletedAt", "description", "difficulty", "explanation", "hints", "id", "isAIGenerated", "isActive", "options", "points", "qualityScore", "reviewStatus", "reviewedAt", "reviewedBy", "subject", "tags", "timeLimit", "title", "type", "updatedAt" FROM "problems";
DROP TABLE "problems";
ALTER TABLE "new_problems" RENAME TO "problems";
CREATE INDEX "problems_subject_idx" ON "problems"("subject");
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");
CREATE INDEX "problems_isAIGenerated_idx" ON "problems"("isAIGenerated");
CREATE INDEX "problems_reviewStatus_idx" ON "problems"("reviewStatus");
CREATE INDEX "problems_type_idx" ON "problems"("type");
CREATE INDEX "problems_aiGenerationId_idx" ON "problems"("aiGenerationId");
CREATE INDEX "problems_reviewedBy_idx" ON "problems"("reviewedBy");
CREATE INDEX "problems_deletedAt_idx" ON "problems"("deletedAt");
CREATE TABLE "new_report_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_insights_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "analysis_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_report_insights" ("category", "content", "createdAt", "id", "priority", "reportId") SELECT "category", "content", "createdAt", "id", "priority", "reportId" FROM "report_insights";
DROP TABLE "report_insights";
ALTER TABLE "new_report_insights" RENAME TO "report_insights";
CREATE INDEX "report_insights_reportId_idx" ON "report_insights"("reportId");
CREATE TABLE "new_report_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_recommendations_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "analysis_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_report_recommendations" ("content", "createdAt", "id", "priority", "reportId", "type") SELECT "content", "createdAt", "id", "priority", "reportId", "type" FROM "report_recommendations";
DROP TABLE "report_recommendations";
ALTER TABLE "new_report_recommendations" RENAME TO "report_recommendations";
CREATE INDEX "report_recommendations_reportId_idx" ON "report_recommendations"("reportId");
CREATE TABLE "new_student_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "problemId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "student_progress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_student_progress" ("attempts", "createdAt", "id", "problemId", "score", "status", "studentId", "timeSpent", "updatedAt") SELECT "attempts", "createdAt", "id", "problemId", "score", "status", "studentId", "timeSpent", "updatedAt" FROM "student_progress";
DROP TABLE "student_progress";
ALTER TABLE "new_student_progress" RENAME TO "student_progress";
CREATE INDEX "student_progress_studentId_idx" ON "student_progress"("studentId");
CREATE INDEX "student_progress_problemId_idx" ON "student_progress"("problemId");
CREATE INDEX "student_progress_status_idx" ON "student_progress"("status");
CREATE UNIQUE INDEX "student_progress_studentId_problemId_key" ON "student_progress"("studentId", "problemId");
CREATE TABLE "new_user_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "preferredDifficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "learningStyle" TEXT NOT NULL,
    "studyTime" INTEGER,
    "interests" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_preferences" ("emailNotifications", "id", "interests", "learningStyle", "preferredDifficulty", "pushNotifications", "studyTime", "userId", "weeklyReport") SELECT "emailNotifications", "id", "interests", "learningStyle", "preferredDifficulty", "pushNotifications", "studyTime", "userId", "weeklyReport" FROM "user_preferences";
DROP TABLE "user_preferences";
ALTER TABLE "new_user_preferences" RENAME TO "user_preferences";
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
