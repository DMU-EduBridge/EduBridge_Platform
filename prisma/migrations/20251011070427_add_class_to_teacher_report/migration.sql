/*
  Warnings:

  - You are about to alter the column `files` on the `learning_materials` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `contextChunkIds` on the `problems` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_learning_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedTime" INTEGER,
    "files" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_learning_materials" ("content", "createdAt", "deletedAt", "description", "difficulty", "estimatedTime", "files", "id", "isActive", "status", "subject", "title", "updatedAt") SELECT "content", "createdAt", "deletedAt", "description", "difficulty", "estimatedTime", "files", "id", "isActive", "status", "subject", "title", "updatedAt" FROM "learning_materials";
DROP TABLE "learning_materials";
ALTER TABLE "new_learning_materials" RENAME TO "learning_materials";
CREATE INDEX "learning_materials_subject_difficulty_isActive_idx" ON "learning_materials"("subject", "difficulty", "isActive");
CREATE INDEX "learning_materials_status_createdAt_idx" ON "learning_materials"("status", "createdAt");
CREATE INDEX "learning_materials_status_subject_createdAt_idx" ON "learning_materials"("status", "subject", "createdAt");
CREATE INDEX "learning_materials_deletedAt_idx" ON "learning_materials"("deletedAt");
CREATE TABLE "new_problems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "unit" TEXT,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "hints" JSONB,
    "tags" JSONB,
    "points" INTEGER NOT NULL DEFAULT 1,
    "timeLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerationId" TEXT,
    "qualityScore" REAL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "generationPrompt" TEXT,
    "contextChunkIds" JSONB,
    "generationTimeMs" INTEGER,
    "modelName" TEXT,
    "tokensUsed" INTEGER,
    "costUsd" REAL,
    "textbookId" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "problems_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_problems" ("aiGenerationId", "content", "contextChunkIds", "correctAnswer", "costUsd", "createdAt", "createdBy", "deletedAt", "description", "difficulty", "explanation", "generationPrompt", "generationTimeMs", "gradeLevel", "hints", "id", "isAIGenerated", "isActive", "modelName", "options", "points", "qualityScore", "reviewStatus", "reviewedAt", "reviewedBy", "status", "subject", "tags", "textbookId", "timeLimit", "title", "tokensUsed", "type", "unit", "updatedAt") SELECT "aiGenerationId", "content", "contextChunkIds", "correctAnswer", "costUsd", "createdAt", "createdBy", "deletedAt", "description", "difficulty", "explanation", "generationPrompt", "generationTimeMs", "gradeLevel", "hints", "id", "isAIGenerated", "isActive", "modelName", "options", "points", "qualityScore", "reviewStatus", "reviewedAt", "reviewedBy", "status", "subject", "tags", "textbookId", "timeLimit", "title", "tokensUsed", "type", "unit", "updatedAt" FROM "problems";
DROP TABLE "problems";
ALTER TABLE "new_problems" RENAME TO "problems";
CREATE INDEX "problems_subject_idx" ON "problems"("subject");
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");
CREATE INDEX "problems_isAIGenerated_idx" ON "problems"("isAIGenerated");
CREATE INDEX "problems_reviewStatus_idx" ON "problems"("reviewStatus");
CREATE INDEX "problems_status_idx" ON "problems"("status");
CREATE INDEX "problems_type_idx" ON "problems"("type");
CREATE INDEX "problems_aiGenerationId_idx" ON "problems"("aiGenerationId");
CREATE INDEX "problems_reviewedBy_idx" ON "problems"("reviewedBy");
CREATE INDEX "problems_deletedAt_idx" ON "problems"("deletedAt");
CREATE INDEX "problems_gradeLevel_idx" ON "problems"("gradeLevel");
CREATE INDEX "problems_createdBy_idx" ON "problems"("createdBy");
CREATE INDEX "problems_textbookId_idx" ON "problems"("textbookId");
CREATE INDEX "problems_subject_difficulty_gradeLevel_idx" ON "problems"("subject", "difficulty", "gradeLevel");
CREATE INDEX "problems_isAIGenerated_reviewStatus_status_createdAt_idx" ON "problems"("isAIGenerated", "reviewStatus", "status", "createdAt");
CREATE INDEX "problems_createdBy_createdAt_idx" ON "problems"("createdBy", "createdAt");
CREATE INDEX "problems_textbookId_gradeLevel_idx" ON "problems"("textbookId", "gradeLevel");
CREATE INDEX "problems_isActive_createdAt_idx" ON "problems"("isActive", "createdAt");
CREATE INDEX "problems_subject_isActive_createdAt_idx" ON "problems"("subject", "isActive", "createdAt");
CREATE TABLE "new_teacher_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'PROGRESS_REPORT',
    "classId" TEXT,
    "classInfo" JSONB,
    "students" JSONB,
    "analysisData" JSONB,
    "metadata" JSONB,
    "tokenUsage" INTEGER,
    "generationTimeMs" INTEGER,
    "modelName" TEXT,
    "costUsd" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teacher_reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "teacher_reports_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_teacher_reports" ("analysisData", "classInfo", "content", "costUsd", "createdAt", "createdBy", "generationTimeMs", "id", "metadata", "modelName", "reportType", "status", "students", "title", "tokenUsage", "updatedAt") SELECT "analysisData", "classInfo", "content", "costUsd", "createdAt", "createdBy", "generationTimeMs", "id", "metadata", "modelName", "reportType", "status", "students", "title", "tokenUsage", "updatedAt" FROM "teacher_reports";
DROP TABLE "teacher_reports";
ALTER TABLE "new_teacher_reports" RENAME TO "teacher_reports";
CREATE INDEX "teacher_reports_createdBy_idx" ON "teacher_reports"("createdBy");
CREATE INDEX "teacher_reports_classId_idx" ON "teacher_reports"("classId");
CREATE INDEX "teacher_reports_status_idx" ON "teacher_reports"("status");
CREATE INDEX "teacher_reports_createdAt_idx" ON "teacher_reports"("createdAt");
CREATE INDEX "teacher_reports_reportType_idx" ON "teacher_reports"("reportType");
CREATE TABLE "new_todos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "description" TEXT,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_todos" ("category", "completed", "createdAt", "description", "dueDate", "id", "priority", "text", "updatedAt", "userId") SELECT "category", "completed", "createdAt", "description", "dueDate", "id", "priority", "text", "updatedAt", "userId" FROM "todos";
DROP TABLE "todos";
ALTER TABLE "new_todos" RENAME TO "todos";
CREATE INDEX "todos_userId_completed_idx" ON "todos"("userId", "completed");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "attempts_userId_studyId_attemptNumber_completedAt_idx" ON "attempts"("userId", "studyId", "attemptNumber", "completedAt");

-- CreateIndex
CREATE INDEX "problem_progress_userId_isCorrect_completedAt_idx" ON "problem_progress"("userId", "isCorrect", "completedAt");

-- CreateIndex
CREATE INDEX "problem_progress_userId_studyId_lastAccessed_idx" ON "problem_progress"("userId", "studyId", "lastAccessed");

-- CreateIndex
CREATE INDEX "problem_progress_userId_studyId_attemptNumber_completedAt_idx" ON "problem_progress"("userId", "studyId", "attemptNumber", "completedAt");
