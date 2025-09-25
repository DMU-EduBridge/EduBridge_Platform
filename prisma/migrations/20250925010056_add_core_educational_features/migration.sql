/*
  Warnings:

  - You are about to drop the `ai_generated_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `metadata` on the `document_chunks` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `hints` on the `problems` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `options` on the `problems` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `tags` on the `problems` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to drop the column `questionId` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `question_tags` table. All the data in the column will be lost.
  - You are about to drop the column `analysis` on the `teacher_reports` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `teacher_reports` table. All the data in the column will be lost.
  - You are about to drop the column `studentCount` on the `teacher_reports` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `teacher_reports` table. All the data in the column will be lost.
  - You are about to alter the column `classInfo` on the `teacher_reports` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to drop the column `grade` on the `users` table. All the data in the column will be lost.
  - Added the required column `problemId` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemId` to the `question_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `teacher_reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ai_generated_questions_createdAt_idx";

-- DropIndex
DROP INDEX "ai_generated_questions_textbookId_idx";

-- DropIndex
DROP INDEX "ai_generated_questions_createdBy_idx";

-- DropIndex
DROP INDEX "ai_generated_questions_difficulty_idx";

-- DropIndex
DROP INDEX "ai_generated_questions_subject_gradeLevel_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ai_generated_questions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "classes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "class_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "class_members_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "class_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "problem_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "instructions" TEXT,
    CONSTRAINT "problem_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_assignments_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "analysisData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_analyses_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "teacher_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "math" REAL,
    "korean" REAL,
    "english" REAL,
    "science" REAL,
    "social" REAL,
    "assignmentRate" REAL,
    "attendanceRate" REAL,
    "reportId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_data_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "teacher_reports" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "class_info" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" INTEGER,
    "classNum" INTEGER,
    "subject" TEXT,
    "semester" TEXT,
    "year" INTEGER,
    "teacher" TEXT,
    "totalStudents" INTEGER,
    "reportId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "class_info_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "teacher_reports" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_server_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverName" TEXT NOT NULL,
    "serverUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "responseTimeMs" INTEGER,
    "version" TEXT,
    "lastChecked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "services" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_server_sync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverName" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "durationMs" INTEGER,
    "recordsProcessed" INTEGER,
    "recordsSynced" INTEGER,
    "errors" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_server_sync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chromadb_collections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionName" TEXT NOT NULL,
    "description" TEXT,
    "persistDirectory" TEXT NOT NULL,
    "totalDocuments" INTEGER NOT NULL DEFAULT 0,
    "totalEmbeddings" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "chromadb_embeddings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "metadata" JSONB,
    "similarityScore" REAL,
    "distance" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chromadb_embeddings_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "chromadb_collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sample_data_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateName" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "description" TEXT,
    "dataStructure" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sample_data_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "question_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelUsed" TEXT,
    "tokensUsed" INTEGER,
    "costUsd" REAL,
    "userId" TEXT,
    CONSTRAINT "question_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "classId" TEXT,
    "selected" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "timeSpent" INTEGER,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "attemptsCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attempts_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_attempts" ("createdAt", "id", "isCorrect", "problemId", "selected", "userId") SELECT "createdAt", "id", "isCorrect", "problemId", "selected", "userId" FROM "attempts";
DROP TABLE "attempts";
ALTER TABLE "new_attempts" RENAME TO "attempts";
CREATE INDEX "attempts_userId_problemId_idx" ON "attempts"("userId", "problemId");
CREATE INDEX "attempts_classId_idx" ON "attempts"("classId");
CREATE INDEX "attempts_startedAt_idx" ON "attempts"("startedAt");
CREATE INDEX "attempts_completedAt_idx" ON "attempts"("completedAt");
CREATE TABLE "new_document_chunks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textbookId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "embeddingId" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_chunks_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_document_chunks" ("chunkIndex", "content", "contentLength", "createdAt", "embeddingId", "id", "metadata", "textbookId") SELECT "chunkIndex", "content", "contentLength", "createdAt", "embeddingId", "id", "metadata", "textbookId" FROM "document_chunks";
DROP TABLE "document_chunks";
ALTER TABLE "new_document_chunks" RENAME TO "document_chunks";
CREATE INDEX "document_chunks_textbookId_idx" ON "document_chunks"("textbookId");
CREATE INDEX "document_chunks_embeddingId_idx" ON "document_chunks"("embeddingId");
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
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "generationPrompt" TEXT,
    "contextChunkIds" TEXT,
    "generationTimeMs" INTEGER,
    "modelName" TEXT,
    "tokensUsed" INTEGER,
    "costUsd" REAL,
    "textbookId" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "problems_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_generations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE INDEX "problems_gradeLevel_idx" ON "problems"("gradeLevel");
CREATE INDEX "problems_createdBy_idx" ON "problems"("createdBy");
CREATE INDEX "problems_textbookId_idx" ON "problems"("textbookId");
CREATE INDEX "problems_subject_difficulty_gradeLevel_idx" ON "problems"("subject", "difficulty", "gradeLevel");
CREATE INDEX "problems_isAIGenerated_reviewStatus_createdAt_idx" ON "problems"("isAIGenerated", "reviewStatus", "createdAt");
CREATE INDEX "problems_createdBy_createdAt_idx" ON "problems"("createdBy", "createdAt");
CREATE INDEX "problems_textbookId_gradeLevel_idx" ON "problems"("textbookId", "gradeLevel");
CREATE TABLE "new_question_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "problemId" TEXT NOT NULL,
    "optionNumber" INTEGER NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_options_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_question_options" ("createdAt", "id", "isCorrect", "optionNumber", "optionText") SELECT "createdAt", "id", "isCorrect", "optionNumber", "optionText" FROM "question_options";
DROP TABLE "question_options";
ALTER TABLE "new_question_options" RENAME TO "question_options";
CREATE INDEX "question_options_problemId_idx" ON "question_options"("problemId");
CREATE TABLE "new_question_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "problemId" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_tags_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_question_tags" ("createdAt", "id", "tagName") SELECT "createdAt", "id", "tagName" FROM "question_tags";
DROP TABLE "question_tags";
ALTER TABLE "new_question_tags" RENAME TO "question_tags";
CREATE INDEX "question_tags_problemId_idx" ON "question_tags"("problemId");
CREATE TABLE "new_search_queries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queryText" TEXT NOT NULL,
    "subject" TEXT,
    "gradeLevel" TEXT,
    "unit" TEXT,
    "resultsCount" INTEGER NOT NULL,
    "searchTimeMs" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_search_queries" ("createdAt", "gradeLevel", "id", "queryText", "resultsCount", "searchTimeMs", "sessionId", "subject", "unit", "userId") SELECT "createdAt", "gradeLevel", "id", "queryText", "resultsCount", "searchTimeMs", "sessionId", "subject", "unit", "userId" FROM "search_queries";
DROP TABLE "search_queries";
ALTER TABLE "new_search_queries" RENAME TO "search_queries";
CREATE INDEX "search_queries_userId_idx" ON "search_queries"("userId");
CREATE INDEX "search_queries_createdAt_idx" ON "search_queries"("createdAt");
CREATE INDEX "search_queries_userId_subject_createdAt_idx" ON "search_queries"("userId", "subject", "createdAt");
CREATE INDEX "search_queries_subject_gradeLevel_createdAt_idx" ON "search_queries"("subject", "gradeLevel", "createdAt");
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
    CONSTRAINT "student_progress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_student_progress" ("attempts", "createdAt", "id", "problemId", "score", "status", "studentId", "timeSpent", "updatedAt") SELECT "attempts", "createdAt", "id", "problemId", "score", "status", "studentId", "timeSpent", "updatedAt" FROM "student_progress";
DROP TABLE "student_progress";
ALTER TABLE "new_student_progress" RENAME TO "student_progress";
CREATE INDEX "student_progress_studentId_idx" ON "student_progress"("studentId");
CREATE INDEX "student_progress_problemId_idx" ON "student_progress"("problemId");
CREATE INDEX "student_progress_status_idx" ON "student_progress"("status");
CREATE INDEX "student_progress_studentId_status_updatedAt_idx" ON "student_progress"("studentId", "status", "updatedAt");
CREATE INDEX "student_progress_problemId_status_idx" ON "student_progress"("problemId", "status");
CREATE UNIQUE INDEX "student_progress_studentId_problemId_key" ON "student_progress"("studentId", "problemId");
CREATE TABLE "new_teacher_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'full',
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
    CONSTRAINT "teacher_reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_teacher_reports" ("classInfo", "content", "createdAt", "id", "reportType", "status", "title", "updatedAt") SELECT "classInfo", "content", "createdAt", "id", "reportType", "status", "title", "updatedAt" FROM "teacher_reports";
DROP TABLE "teacher_reports";
ALTER TABLE "new_teacher_reports" RENAME TO "teacher_reports";
CREATE INDEX "teacher_reports_createdBy_idx" ON "teacher_reports"("createdBy");
CREATE INDEX "teacher_reports_status_idx" ON "teacher_reports"("status");
CREATE INDEX "teacher_reports_createdAt_idx" ON "teacher_reports"("createdAt");
CREATE TABLE "new_textbooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "publisher" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "textbooks_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_textbooks" ("createdAt", "errorMessage", "fileName", "filePath", "fileSize", "gradeLevel", "id", "mimeType", "processingStatus", "publisher", "subject", "title", "totalChunks", "updatedAt", "uploadedBy") SELECT "createdAt", "errorMessage", "fileName", "filePath", "fileSize", "gradeLevel", "id", "mimeType", "processingStatus", "publisher", "subject", "title", "totalChunks", "updatedAt", "uploadedBy" FROM "textbooks";
DROP TABLE "textbooks";
ALTER TABLE "new_textbooks" RENAME TO "textbooks";
CREATE INDEX "textbooks_subject_gradeLevel_idx" ON "textbooks"("subject", "gradeLevel");
CREATE INDEX "textbooks_processingStatus_idx" ON "textbooks"("processingStatus");
CREATE INDEX "textbooks_uploadedBy_idx" ON "textbooks"("uploadedBy");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "gradeLevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "school" TEXT,
    "subject" TEXT,
    "lastLoginAt" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME
);
INSERT INTO "new_users" ("avatar", "bio", "createdAt", "deletedAt", "email", "id", "name", "role", "school", "status", "subject", "updatedAt") SELECT "avatar", "bio", "createdAt", "deletedAt", "email", "id", "name", "role", "school", "status", "subject", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");
CREATE INDEX "users_lastLoginAt_idx" ON "users"("lastLoginAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "classes_createdBy_idx" ON "classes"("createdBy");

-- CreateIndex
CREATE INDEX "classes_subject_gradeLevel_idx" ON "classes"("subject", "gradeLevel");

-- CreateIndex
CREATE INDEX "classes_schoolYear_semester_idx" ON "classes"("schoolYear", "semester");

-- CreateIndex
CREATE INDEX "classes_isActive_idx" ON "classes"("isActive");

-- CreateIndex
CREATE INDEX "classes_deletedAt_idx" ON "classes"("deletedAt");

-- CreateIndex
CREATE INDEX "class_members_classId_idx" ON "class_members"("classId");

-- CreateIndex
CREATE INDEX "class_members_userId_idx" ON "class_members"("userId");

-- CreateIndex
CREATE INDEX "class_members_role_idx" ON "class_members"("role");

-- CreateIndex
CREATE INDEX "class_members_isActive_idx" ON "class_members"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "class_members_classId_userId_key" ON "class_members"("classId", "userId");

-- CreateIndex
CREATE INDEX "problem_assignments_classId_idx" ON "problem_assignments"("classId");

-- CreateIndex
CREATE INDEX "problem_assignments_problemId_idx" ON "problem_assignments"("problemId");

-- CreateIndex
CREATE INDEX "problem_assignments_assignedBy_idx" ON "problem_assignments"("assignedBy");

-- CreateIndex
CREATE INDEX "problem_assignments_dueDate_idx" ON "problem_assignments"("dueDate");

-- CreateIndex
CREATE INDEX "problem_assignments_isActive_idx" ON "problem_assignments"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "problem_assignments_classId_problemId_key" ON "problem_assignments"("classId", "problemId");

-- CreateIndex
CREATE INDEX "report_analyses_reportId_idx" ON "report_analyses"("reportId");

-- CreateIndex
CREATE INDEX "report_analyses_analysisType_idx" ON "report_analyses"("analysisType");

-- CreateIndex
CREATE INDEX "student_data_reportId_idx" ON "student_data"("reportId");

-- CreateIndex
CREATE INDEX "student_data_studentId_idx" ON "student_data"("studentId");

-- CreateIndex
CREATE INDEX "class_info_reportId_idx" ON "class_info"("reportId");

-- CreateIndex
CREATE INDEX "ai_server_status_serverName_idx" ON "ai_server_status"("serverName");

-- CreateIndex
CREATE INDEX "ai_server_status_status_idx" ON "ai_server_status"("status");

-- CreateIndex
CREATE INDEX "ai_server_status_lastChecked_idx" ON "ai_server_status"("lastChecked");

-- CreateIndex
CREATE INDEX "ai_server_sync_serverName_idx" ON "ai_server_sync"("serverName");

-- CreateIndex
CREATE INDEX "ai_server_sync_status_idx" ON "ai_server_sync"("status");

-- CreateIndex
CREATE INDEX "ai_server_sync_startTime_idx" ON "ai_server_sync"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "chromadb_collections_collectionName_key" ON "chromadb_collections"("collectionName");

-- CreateIndex
CREATE INDEX "chromadb_collections_collectionName_idx" ON "chromadb_collections"("collectionName");

-- CreateIndex
CREATE INDEX "chromadb_embeddings_collectionId_idx" ON "chromadb_embeddings"("collectionId");

-- CreateIndex
CREATE INDEX "chromadb_embeddings_documentId_idx" ON "chromadb_embeddings"("documentId");

-- CreateIndex
CREATE INDEX "chromadb_embeddings_similarityScore_idx" ON "chromadb_embeddings"("similarityScore");

-- CreateIndex
CREATE INDEX "sample_data_templates_templateName_idx" ON "sample_data_templates"("templateName");

-- CreateIndex
CREATE INDEX "sample_data_templates_templateType_idx" ON "sample_data_templates"("templateType");

-- CreateIndex
CREATE INDEX "question_history_questionId_idx" ON "question_history"("questionId");

-- CreateIndex
CREATE INDEX "question_history_subject_idx" ON "question_history"("subject");

-- CreateIndex
CREATE INDEX "question_history_generatedAt_idx" ON "question_history"("generatedAt");
