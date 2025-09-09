-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "grade" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "preferredDifficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "learningStyle" TEXT NOT NULL,
    "studyTime" INTEGER,
    "interests" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "learning_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedTime" INTEGER,
    "files" TEXT,
    "status" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "problems" (
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
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "student_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "problemId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "analysis_reports" (
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
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "career_counseling" (
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
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "learning_material_problems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learningMaterialId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "cost" REAL,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "report_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "report_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "learning_materials_subject_difficulty_isActive_idx" ON "learning_materials"("subject", "difficulty", "isActive");

-- CreateIndex
CREATE INDEX "learning_materials_status_createdAt_idx" ON "learning_materials"("status", "createdAt");

-- CreateIndex
CREATE INDEX "learning_materials_deletedAt_idx" ON "learning_materials"("deletedAt");

-- CreateIndex
CREATE INDEX "problems_subject_idx" ON "problems"("subject");

-- CreateIndex
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");

-- CreateIndex
CREATE INDEX "problems_isAIGenerated_idx" ON "problems"("isAIGenerated");

-- CreateIndex
CREATE INDEX "problems_reviewStatus_idx" ON "problems"("reviewStatus");

-- CreateIndex
CREATE INDEX "problems_type_idx" ON "problems"("type");

-- CreateIndex
CREATE INDEX "problems_aiGenerationId_idx" ON "problems"("aiGenerationId");

-- CreateIndex
CREATE INDEX "problems_reviewedBy_idx" ON "problems"("reviewedBy");

-- CreateIndex
CREATE INDEX "problems_deletedAt_idx" ON "problems"("deletedAt");

-- CreateIndex
CREATE INDEX "student_progress_studentId_idx" ON "student_progress"("studentId");

-- CreateIndex
CREATE INDEX "student_progress_problemId_idx" ON "student_progress"("problemId");

-- CreateIndex
CREATE INDEX "student_progress_status_idx" ON "student_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_studentId_problemId_key" ON "student_progress"("studentId", "problemId");

-- CreateIndex
CREATE INDEX "analysis_reports_studentId_idx" ON "analysis_reports"("studentId");

-- CreateIndex
CREATE INDEX "analysis_reports_type_idx" ON "analysis_reports"("type");

-- CreateIndex
CREATE INDEX "analysis_reports_status_idx" ON "analysis_reports"("status");

-- CreateIndex
CREATE INDEX "analysis_reports_createdAt_idx" ON "analysis_reports"("createdAt");

-- CreateIndex
CREATE INDEX "analysis_reports_aiGenerationId_idx" ON "analysis_reports"("aiGenerationId");

-- CreateIndex
CREATE INDEX "analysis_reports_deletedAt_idx" ON "analysis_reports"("deletedAt");

-- CreateIndex
CREATE INDEX "career_counseling_studentId_idx" ON "career_counseling"("studentId");

-- CreateIndex
CREATE INDEX "career_counseling_type_idx" ON "career_counseling"("type");

-- CreateIndex
CREATE INDEX "career_counseling_status_idx" ON "career_counseling"("status");

-- CreateIndex
CREATE INDEX "career_counseling_aiGenerationId_idx" ON "career_counseling"("aiGenerationId");

-- CreateIndex
CREATE INDEX "career_counseling_deletedAt_idx" ON "career_counseling"("deletedAt");

-- CreateIndex
CREATE INDEX "learning_material_problems_learningMaterialId_idx" ON "learning_material_problems"("learningMaterialId");

-- CreateIndex
CREATE INDEX "learning_material_problems_problemId_idx" ON "learning_material_problems"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_material_problems_learningMaterialId_problemId_key" ON "learning_material_problems"("learningMaterialId", "problemId");

-- CreateIndex
CREATE INDEX "ai_generations_modelId_idx" ON "ai_generations"("modelId");

-- CreateIndex
CREATE INDEX "ai_generations_createdAt_idx" ON "ai_generations"("createdAt");

-- CreateIndex
CREATE INDEX "report_insights_reportId_idx" ON "report_insights"("reportId");

-- CreateIndex
CREATE INDEX "report_recommendations_reportId_idx" ON "report_recommendations"("reportId");
