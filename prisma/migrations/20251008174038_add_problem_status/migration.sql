-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "problems_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_problems" ("aiGenerationId", "content", "contextChunkIds", "correctAnswer", "costUsd", "createdAt", "createdBy", "deletedAt", "description", "difficulty", "explanation", "generationPrompt", "generationTimeMs", "gradeLevel", "hints", "id", "isAIGenerated", "isActive", "modelName", "options", "points", "qualityScore", "reviewStatus", "reviewedAt", "reviewedBy", "subject", "tags", "textbookId", "timeLimit", "title", "tokensUsed", "type", "unit", "updatedAt") SELECT "aiGenerationId", "content", "contextChunkIds", "correctAnswer", "costUsd", "createdAt", "createdBy", "deletedAt", "description", "difficulty", "explanation", "generationPrompt", "generationTimeMs", "gradeLevel", "hints", "id", "isAIGenerated", "isActive", "modelName", "options", "points", "qualityScore", "reviewStatus", "reviewedAt", "reviewedBy", "subject", "tags", "textbookId", "timeLimit", "title", "tokensUsed", "type", "unit", "updatedAt" FROM "problems";
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
