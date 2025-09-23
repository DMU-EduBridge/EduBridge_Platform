/*
  Warnings:

  - You are about to drop the column `api_type` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `cost_usd` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `error_message` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `model_name` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `request_count` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `response_time_ms` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `tokens_used` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ai_api_usage` table. All the data in the column will be lost.
  - You are about to drop the column `context_chunk_ids` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answer` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `cost_usd` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `generation_prompt` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `generation_time_ms` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `grade_level` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `model_name` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `quality_score` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `textbook_id` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `tokens_used` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ai_generated_questions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ai_performance_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `duration_ms` on the `ai_performance_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `error_message` on the `ai_performance_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `operation_type` on the `ai_performance_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ai_performance_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ai_usage_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `questions_generated` on the `ai_usage_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `searches_performed` on the `ai_usage_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `textbooks_uploaded` on the `ai_usage_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `total_cost_usd` on the `ai_usage_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ai_usage_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `chunk_index` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `content_length` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `embedding_id` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `textbook_id` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `is_correct` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `option_number` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `option_text` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `question_tags` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `question_tags` table. All the data in the column will be lost.
  - You are about to drop the column `tag_name` on the `question_tags` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `search_queries` table. All the data in the column will be lost.
  - You are about to drop the column `grade_level` on the `search_queries` table. All the data in the column will be lost.
  - You are about to drop the column `query_text` on the `search_queries` table. All the data in the column will be lost.
  - You are about to drop the column `results_count` on the `search_queries` table. All the data in the column will be lost.
  - You are about to drop the column `search_time_ms` on the `search_queries` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `search_queries` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `search_queries` table. All the data in the column will be lost.
  - You are about to drop the column `chunk_id` on the `search_results` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `search_results` table. All the data in the column will be lost.
  - You are about to drop the column `query_id` on the `search_results` table. All the data in the column will be lost.
  - You are about to drop the column `rank_position` on the `search_results` table. All the data in the column will be lost.
  - You are about to drop the column `similarity_score` on the `search_results` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `error_message` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `file_size` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `grade_level` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `mime_type` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `processing_status` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `total_chunks` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `textbooks` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_by` on the `textbooks` table. All the data in the column will be lost.
  - Added the required column `apiType` to the `ai_api_usage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costUsd` to the `ai_api_usage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelName` to the `ai_api_usage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokensUsed` to the `ai_api_usage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ai_api_usage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctAnswer` to the `ai_generated_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `ai_generated_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradeLevel` to the `ai_generated_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `ai_generated_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ai_generated_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMs` to the `ai_performance_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operationType` to the `ai_performance_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ai_usage_statistics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chunkIndex` to the `document_chunks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentLength` to the `document_chunks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `textbookId` to the `document_chunks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCorrect` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionNumber` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionText` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `question_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagName` to the `question_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queryText` to the `search_queries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultsCount` to the `search_queries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `searchTimeMs` to the `search_queries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `search_queries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chunkId` to the `search_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queryId` to the `search_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rankPosition` to the `search_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `similarityScore` to the `search_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `textbooks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `textbooks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `textbooks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradeLevel` to the `textbooks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `textbooks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `textbooks` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ai_api_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "apiType" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "costUsd" REAL NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "responseTimeMs" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_api_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ai_api_usage" ("id", "success") SELECT "id", coalesce("success", true) AS "success" FROM "ai_api_usage";
DROP TABLE "ai_api_usage";
ALTER TABLE "new_ai_api_usage" RENAME TO "ai_api_usage";
CREATE INDEX "ai_api_usage_userId_idx" ON "ai_api_usage"("userId");
CREATE INDEX "ai_api_usage_createdAt_idx" ON "ai_api_usage"("createdAt");
CREATE TABLE "new_ai_generated_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionText" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "unit" TEXT,
    "difficulty" TEXT NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "generationPrompt" TEXT,
    "contextChunkIds" TEXT NOT NULL DEFAULT '[]',
    "qualityScore" REAL,
    "generationTimeMs" INTEGER,
    "modelName" TEXT,
    "tokensUsed" INTEGER,
    "costUsd" REAL,
    "createdBy" TEXT NOT NULL,
    "textbookId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_generated_questions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ai_generated_questions_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ai_generated_questions" ("difficulty", "explanation", "id", "subject", "unit") SELECT "difficulty", "explanation", "id", "subject", "unit" FROM "ai_generated_questions";
DROP TABLE "ai_generated_questions";
ALTER TABLE "new_ai_generated_questions" RENAME TO "ai_generated_questions";
CREATE INDEX "ai_generated_questions_subject_gradeLevel_idx" ON "ai_generated_questions"("subject", "gradeLevel");
CREATE INDEX "ai_generated_questions_difficulty_idx" ON "ai_generated_questions"("difficulty");
CREATE INDEX "ai_generated_questions_createdBy_idx" ON "ai_generated_questions"("createdBy");
CREATE INDEX "ai_generated_questions_textbookId_idx" ON "ai_generated_questions"("textbookId");
CREATE INDEX "ai_generated_questions_createdAt_idx" ON "ai_generated_questions"("createdAt");
CREATE TABLE "new_ai_performance_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operationType" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_performance_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ai_performance_metrics" ("id", "metadata", "success") SELECT "id", coalesce("metadata", '{}') AS "metadata", "success" FROM "ai_performance_metrics";
DROP TABLE "ai_performance_metrics";
ALTER TABLE "new_ai_performance_metrics" RENAME TO "ai_performance_metrics";
CREATE INDEX "ai_performance_metrics_operationType_idx" ON "ai_performance_metrics"("operationType");
CREATE INDEX "ai_performance_metrics_createdAt_idx" ON "ai_performance_metrics"("createdAt");
CREATE TABLE "new_ai_usage_statistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "questionsGenerated" INTEGER NOT NULL DEFAULT 0,
    "textbooksUploaded" INTEGER NOT NULL DEFAULT 0,
    "searchesPerformed" INTEGER NOT NULL DEFAULT 0,
    "totalCostUsd" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_usage_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ai_usage_statistics" ("date", "id") SELECT "date", "id" FROM "ai_usage_statistics";
DROP TABLE "ai_usage_statistics";
ALTER TABLE "new_ai_usage_statistics" RENAME TO "ai_usage_statistics";
CREATE INDEX "ai_usage_statistics_userId_date_idx" ON "ai_usage_statistics"("userId", "date");
CREATE UNIQUE INDEX "ai_usage_statistics_userId_date_key" ON "ai_usage_statistics"("userId", "date");
CREATE TABLE "new_document_chunks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textbookId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "embeddingId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_chunks_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_document_chunks" ("content", "id", "metadata") SELECT "content", "id", coalesce("metadata", '{}') AS "metadata" FROM "document_chunks";
DROP TABLE "document_chunks";
ALTER TABLE "new_document_chunks" RENAME TO "document_chunks";
CREATE INDEX "document_chunks_textbookId_idx" ON "document_chunks"("textbookId");
CREATE INDEX "document_chunks_embeddingId_idx" ON "document_chunks"("embeddingId");
CREATE TABLE "new_question_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "optionNumber" INTEGER NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ai_generated_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_question_options" ("id") SELECT "id" FROM "question_options";
DROP TABLE "question_options";
ALTER TABLE "new_question_options" RENAME TO "question_options";
CREATE INDEX "question_options_questionId_idx" ON "question_options"("questionId");
CREATE TABLE "new_question_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_tags_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ai_generated_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_question_tags" ("id") SELECT "id" FROM "question_tags";
DROP TABLE "question_tags";
ALTER TABLE "new_question_tags" RENAME TO "question_tags";
CREATE INDEX "question_tags_questionId_idx" ON "question_tags"("questionId");
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
    CONSTRAINT "search_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_search_queries" ("id", "subject", "unit") SELECT "id", "subject", "unit" FROM "search_queries";
DROP TABLE "search_queries";
ALTER TABLE "new_search_queries" RENAME TO "search_queries";
CREATE INDEX "search_queries_userId_idx" ON "search_queries"("userId");
CREATE INDEX "search_queries_createdAt_idx" ON "search_queries"("createdAt");
CREATE TABLE "new_search_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queryId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "similarityScore" REAL NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_results_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "search_queries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "search_results_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "document_chunks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_search_results" ("id") SELECT "id" FROM "search_results";
DROP TABLE "search_results";
ALTER TABLE "new_search_results" RENAME TO "search_results";
CREATE INDEX "search_results_queryId_idx" ON "search_results"("queryId");
CREATE INDEX "search_results_chunkId_idx" ON "search_results"("chunkId");
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
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "textbooks_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_textbooks" ("id", "publisher", "subject", "title") SELECT "id", "publisher", "subject", "title" FROM "textbooks";
DROP TABLE "textbooks";
ALTER TABLE "new_textbooks" RENAME TO "textbooks";
CREATE INDEX "textbooks_subject_gradeLevel_idx" ON "textbooks"("subject", "gradeLevel");
CREATE INDEX "textbooks_processingStatus_idx" ON "textbooks"("processingStatus");
CREATE INDEX "textbooks_uploadedBy_idx" ON "textbooks"("uploadedBy");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
