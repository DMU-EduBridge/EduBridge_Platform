-- CreateTable
CREATE TABLE "users" (
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
CREATE TABLE "user_preferences" (
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
    CONSTRAINT "problems_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "problems_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_reports" (
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

-- CreateTable
CREATE TABLE "learning_material_problems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learningMaterialId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_material_problems_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "learning_material_problems_learningMaterialId_fkey" FOREIGN KEY ("learningMaterialId") REFERENCES "learning_materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "totalProblems" INTEGER NOT NULL,
    "completedProblems" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "study_sessions_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "learning_materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "studySessionId" TEXT NOT NULL,
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
    CONSTRAINT "attempts_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "study_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "problem_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "selectedAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "problem_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_progress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_progress_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "learning_materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
CREATE TABLE "textbooks" (
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

-- CreateTable
CREATE TABLE "document_chunks" (
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

-- CreateTable
CREATE TABLE "search_queries" (
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

-- CreateTable
CREATE TABLE "search_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queryId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "similarityScore" REAL NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_results_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "search_queries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "search_results_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "document_chunks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "users_lastLoginAt_idx" ON "users"("lastLoginAt");

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
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "learning_materials_subject_difficulty_isActive_idx" ON "learning_materials"("subject", "difficulty", "isActive");

-- CreateIndex
CREATE INDEX "learning_materials_status_createdAt_idx" ON "learning_materials"("status", "createdAt");

-- CreateIndex
CREATE INDEX "learning_materials_status_subject_createdAt_idx" ON "learning_materials"("status", "subject", "createdAt");

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
CREATE INDEX "problems_gradeLevel_idx" ON "problems"("gradeLevel");

-- CreateIndex
CREATE INDEX "problems_createdBy_idx" ON "problems"("createdBy");

-- CreateIndex
CREATE INDEX "problems_textbookId_idx" ON "problems"("textbookId");

-- CreateIndex
CREATE INDEX "problems_subject_difficulty_gradeLevel_idx" ON "problems"("subject", "difficulty", "gradeLevel");

-- CreateIndex
CREATE INDEX "problems_isAIGenerated_reviewStatus_createdAt_idx" ON "problems"("isAIGenerated", "reviewStatus", "createdAt");

-- CreateIndex
CREATE INDEX "problems_createdBy_createdAt_idx" ON "problems"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "problems_textbookId_gradeLevel_idx" ON "problems"("textbookId", "gradeLevel");

-- CreateIndex
CREATE INDEX "teacher_reports_createdBy_idx" ON "teacher_reports"("createdBy");

-- CreateIndex
CREATE INDEX "teacher_reports_status_idx" ON "teacher_reports"("status");

-- CreateIndex
CREATE INDEX "teacher_reports_createdAt_idx" ON "teacher_reports"("createdAt");

-- CreateIndex
CREATE INDEX "learning_material_problems_learningMaterialId_idx" ON "learning_material_problems"("learningMaterialId");

-- CreateIndex
CREATE INDEX "learning_material_problems_problemId_idx" ON "learning_material_problems"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_material_problems_learningMaterialId_problemId_key" ON "learning_material_problems"("learningMaterialId", "problemId");

-- CreateIndex
CREATE INDEX "study_sessions_userId_studyId_idx" ON "study_sessions"("userId", "studyId");

-- CreateIndex
CREATE INDEX "study_sessions_isCompleted_idx" ON "study_sessions"("isCompleted");

-- CreateIndex
CREATE INDEX "study_sessions_createdAt_idx" ON "study_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "attempts_userId_problemId_idx" ON "attempts"("userId", "problemId");

-- CreateIndex
CREATE INDEX "attempts_studySessionId_idx" ON "attempts"("studySessionId");

-- CreateIndex
CREATE INDEX "attempts_classId_idx" ON "attempts"("classId");

-- CreateIndex
CREATE INDEX "attempts_startedAt_idx" ON "attempts"("startedAt");

-- CreateIndex
CREATE INDEX "attempts_completedAt_idx" ON "attempts"("completedAt");

-- CreateIndex
CREATE INDEX "problem_progress_studyId_idx" ON "problem_progress"("studyId");

-- CreateIndex
CREATE INDEX "problem_progress_userId_studyId_idx" ON "problem_progress"("userId", "studyId");

-- CreateIndex
CREATE UNIQUE INDEX "problem_progress_userId_problemId_attemptNumber_key" ON "problem_progress"("userId", "problemId", "attemptNumber");

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
CREATE INDEX "textbooks_subject_gradeLevel_idx" ON "textbooks"("subject", "gradeLevel");

-- CreateIndex
CREATE INDEX "textbooks_processingStatus_idx" ON "textbooks"("processingStatus");

-- CreateIndex
CREATE INDEX "textbooks_uploadedBy_idx" ON "textbooks"("uploadedBy");

-- CreateIndex
CREATE INDEX "document_chunks_textbookId_idx" ON "document_chunks"("textbookId");

-- CreateIndex
CREATE INDEX "document_chunks_embeddingId_idx" ON "document_chunks"("embeddingId");

-- CreateIndex
CREATE INDEX "search_queries_userId_idx" ON "search_queries"("userId");

-- CreateIndex
CREATE INDEX "search_queries_createdAt_idx" ON "search_queries"("createdAt");

-- CreateIndex
CREATE INDEX "search_queries_userId_subject_createdAt_idx" ON "search_queries"("userId", "subject", "createdAt");

-- CreateIndex
CREATE INDEX "search_queries_subject_gradeLevel_createdAt_idx" ON "search_queries"("subject", "gradeLevel", "createdAt");

-- CreateIndex
CREATE INDEX "search_results_queryId_idx" ON "search_results"("queryId");

-- CreateIndex
CREATE INDEX "search_results_chunkId_idx" ON "search_results"("chunkId");

-- CreateIndex
CREATE INDEX "report_analyses_reportId_idx" ON "report_analyses"("reportId");

-- CreateIndex
CREATE INDEX "report_analyses_analysisType_idx" ON "report_analyses"("analysisType");

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
