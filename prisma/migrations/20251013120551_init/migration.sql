-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."ProblemDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."ProblemType" AS ENUM ('MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'CODING', 'MATH');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "public"."ProblemStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ServerStatus" AS ENUM ('HEALTHY', 'UNHEALTHY', 'UNKNOWN', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AnalysisType" AS ENUM ('BASIC_STATISTICS', 'ACHIEVEMENT_DISTRIBUTION', 'STRUGGLING_STUDENTS', 'TOP_PERFORMERS', 'SUBJECT_ANALYSIS', 'TREND_ANALYSIS');

-- CreateEnum
CREATE TYPE "public"."ClassMemberRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."LearningStyle" AS ENUM ('VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING');

-- CreateEnum
CREATE TYPE "public"."Subject" AS ENUM ('KOREAN', 'MATH', 'ENGLISH', 'SCIENCE', 'SOCIAL_STUDIES', 'HISTORY', 'GEOGRAPHY', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'COMPUTER_SCIENCE', 'ART', 'MUSIC', 'PHYSICAL_EDUCATION', 'ETHICS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MaterialStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."GradeLevel" AS ENUM ('KINDERGARTEN', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12', 'UNIVERSITY', 'ADULT');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('PROGRESS_REPORT', 'PERFORMANCE_ANALYSIS', 'CLASS_SUMMARY', 'STUDENT_INSIGHTS');

-- CreateEnum
CREATE TYPE "public"."TodoPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."TodoCategory" AS ENUM ('PERSONAL', 'WORK', 'STUDY', 'HEALTH', 'FINANCE', 'FAMILY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."TextbookStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SyncType" AS ENUM ('FULL_SYNC', 'INCREMENTAL_SYNC', 'MANUAL_SYNC', 'SCHEDULED_SYNC');

-- CreateEnum
CREATE TYPE "public"."AssignmentType" AS ENUM ('HOMEWORK', 'QUIZ', 'EXAM', 'PRACTICE', 'REVIEW', 'PROJECT');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "gradeLevel" TEXT,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "school" TEXT,
    "subject" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_members" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."ClassMemberRole" NOT NULL DEFAULT 'STUDENT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "class_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredDifficulty" "public"."ProblemDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "learningStyle" "public"."LearningStyle" NOT NULL,
    "studyTime" INTEGER,
    "interests" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_materials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "subject" "public"."Subject" NOT NULL,
    "difficulty" "public"."ProblemDifficulty" NOT NULL,
    "estimatedTime" INTEGER,
    "files" JSONB,
    "status" "public"."MaterialStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "learning_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problems" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "type" "public"."ProblemType" NOT NULL,
    "difficulty" "public"."ProblemDifficulty" NOT NULL,
    "subject" "public"."Subject" NOT NULL,
    "gradeLevel" "public"."GradeLevel",
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
    "qualityScore" DOUBLE PRECISION,
    "reviewStatus" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "status" "public"."ProblemStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "generationPrompt" TEXT,
    "contextChunkIds" JSONB,
    "generationTimeMs" INTEGER,
    "modelName" TEXT,
    "tokensUsed" INTEGER,
    "costUsd" DOUBLE PRECISION,
    "textbookId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reportType" "public"."ReportType" NOT NULL DEFAULT 'PROGRESS_REPORT',
    "classId" TEXT,
    "classInfo" JSONB,
    "students" JSONB,
    "analysisData" JSONB,
    "metadata" JSONB,
    "tokenUsage" INTEGER,
    "generationTimeMs" INTEGER,
    "modelName" TEXT,
    "costUsd" DOUBLE PRECISION,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_material_problems" (
    "id" TEXT NOT NULL,
    "learningMaterialId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_material_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "selectedAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyId" TEXT,
    "problemId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "selected" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignmentType" "public"."AssignmentType" NOT NULL DEFAULT 'HOMEWORK',
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "classId" TEXT,
    "studentId" TEXT,
    "problemIds" JSONB NOT NULL,
    "dueDate" TIMESTAMP(3),
    "instructions" TEXT,
    "metadata" JSONB,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."todos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "public"."TodoPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" "public"."TodoCategory",
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."textbooks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" "public"."Subject" NOT NULL,
    "gradeLevel" "public"."GradeLevel" NOT NULL,
    "publisher" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "processingStatus" "public"."ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "textbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_chunks" (
    "id" TEXT NOT NULL,
    "textbookId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "embeddingId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_queries" (
    "id" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "subject" "public"."Subject",
    "gradeLevel" "public"."GradeLevel",
    "unit" TEXT,
    "resultsCount" INTEGER NOT NULL,
    "searchTimeMs" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_results" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_analyses" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "analysisType" "public"."AnalysisType" NOT NULL,
    "analysisData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_server_status" (
    "id" TEXT NOT NULL,
    "serverName" TEXT NOT NULL,
    "serverUrl" TEXT NOT NULL,
    "status" "public"."ServerStatus" NOT NULL DEFAULT 'UNKNOWN',
    "responseTimeMs" INTEGER,
    "version" TEXT,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "services" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_server_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_server_sync" (
    "id" TEXT NOT NULL,
    "serverName" TEXT NOT NULL,
    "syncType" "public"."SyncType" NOT NULL,
    "status" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "durationMs" INTEGER,
    "recordsProcessed" INTEGER,
    "recordsSynced" INTEGER,
    "errors" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_server_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "public"."users"("deletedAt");

-- CreateIndex
CREATE INDEX "users_lastLoginAt_idx" ON "public"."users"("lastLoginAt");

-- CreateIndex
CREATE INDEX "classes_createdBy_idx" ON "public"."classes"("createdBy");

-- CreateIndex
CREATE INDEX "classes_subject_gradeLevel_idx" ON "public"."classes"("subject", "gradeLevel");

-- CreateIndex
CREATE INDEX "classes_schoolYear_semester_idx" ON "public"."classes"("schoolYear", "semester");

-- CreateIndex
CREATE INDEX "classes_isActive_idx" ON "public"."classes"("isActive");

-- CreateIndex
CREATE INDEX "classes_deletedAt_idx" ON "public"."classes"("deletedAt");

-- CreateIndex
CREATE INDEX "class_members_classId_idx" ON "public"."class_members"("classId");

-- CreateIndex
CREATE INDEX "class_members_userId_idx" ON "public"."class_members"("userId");

-- CreateIndex
CREATE INDEX "class_members_role_idx" ON "public"."class_members"("role");

-- CreateIndex
CREATE INDEX "class_members_isActive_idx" ON "public"."class_members"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "class_members_classId_userId_key" ON "public"."class_members"("classId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "public"."user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "public"."user_preferences"("userId");

-- CreateIndex
CREATE INDEX "learning_materials_subject_difficulty_isActive_idx" ON "public"."learning_materials"("subject", "difficulty", "isActive");

-- CreateIndex
CREATE INDEX "learning_materials_status_createdAt_idx" ON "public"."learning_materials"("status", "createdAt");

-- CreateIndex
CREATE INDEX "learning_materials_status_subject_createdAt_idx" ON "public"."learning_materials"("status", "subject", "createdAt");

-- CreateIndex
CREATE INDEX "learning_materials_deletedAt_idx" ON "public"."learning_materials"("deletedAt");

-- CreateIndex
CREATE INDEX "problems_subject_idx" ON "public"."problems"("subject");

-- CreateIndex
CREATE INDEX "problems_difficulty_idx" ON "public"."problems"("difficulty");

-- CreateIndex
CREATE INDEX "problems_isAIGenerated_idx" ON "public"."problems"("isAIGenerated");

-- CreateIndex
CREATE INDEX "problems_reviewStatus_idx" ON "public"."problems"("reviewStatus");

-- CreateIndex
CREATE INDEX "problems_status_idx" ON "public"."problems"("status");

-- CreateIndex
CREATE INDEX "problems_type_idx" ON "public"."problems"("type");

-- CreateIndex
CREATE INDEX "problems_aiGenerationId_idx" ON "public"."problems"("aiGenerationId");

-- CreateIndex
CREATE INDEX "problems_reviewedBy_idx" ON "public"."problems"("reviewedBy");

-- CreateIndex
CREATE INDEX "problems_deletedAt_idx" ON "public"."problems"("deletedAt");

-- CreateIndex
CREATE INDEX "problems_gradeLevel_idx" ON "public"."problems"("gradeLevel");

-- CreateIndex
CREATE INDEX "problems_createdBy_idx" ON "public"."problems"("createdBy");

-- CreateIndex
CREATE INDEX "problems_textbookId_idx" ON "public"."problems"("textbookId");

-- CreateIndex
CREATE INDEX "problems_subject_difficulty_gradeLevel_idx" ON "public"."problems"("subject", "difficulty", "gradeLevel");

-- CreateIndex
CREATE INDEX "problems_isAIGenerated_reviewStatus_status_createdAt_idx" ON "public"."problems"("isAIGenerated", "reviewStatus", "status", "createdAt");

-- CreateIndex
CREATE INDEX "problems_createdBy_createdAt_idx" ON "public"."problems"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "problems_textbookId_gradeLevel_idx" ON "public"."problems"("textbookId", "gradeLevel");

-- CreateIndex
CREATE INDEX "problems_isActive_createdAt_idx" ON "public"."problems"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "problems_subject_isActive_createdAt_idx" ON "public"."problems"("subject", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "teacher_reports_createdBy_idx" ON "public"."teacher_reports"("createdBy");

-- CreateIndex
CREATE INDEX "teacher_reports_classId_idx" ON "public"."teacher_reports"("classId");

-- CreateIndex
CREATE INDEX "teacher_reports_status_idx" ON "public"."teacher_reports"("status");

-- CreateIndex
CREATE INDEX "teacher_reports_createdAt_idx" ON "public"."teacher_reports"("createdAt");

-- CreateIndex
CREATE INDEX "teacher_reports_reportType_idx" ON "public"."teacher_reports"("reportType");

-- CreateIndex
CREATE INDEX "learning_material_problems_learningMaterialId_idx" ON "public"."learning_material_problems"("learningMaterialId");

-- CreateIndex
CREATE INDEX "learning_material_problems_problemId_idx" ON "public"."learning_material_problems"("problemId");

-- CreateIndex
CREATE INDEX "learning_material_problems_learningMaterialId_order_idx" ON "public"."learning_material_problems"("learningMaterialId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "learning_material_problems_learningMaterialId_problemId_key" ON "public"."learning_material_problems"("learningMaterialId", "problemId");

-- CreateIndex
CREATE INDEX "problem_progress_studyId_idx" ON "public"."problem_progress"("studyId");

-- CreateIndex
CREATE INDEX "problem_progress_userId_studyId_idx" ON "public"."problem_progress"("userId", "studyId");

-- CreateIndex
CREATE INDEX "problem_progress_userId_studyId_attemptNumber_idx" ON "public"."problem_progress"("userId", "studyId", "attemptNumber");

-- CreateIndex
CREATE INDEX "problem_progress_userId_isCorrect_completedAt_idx" ON "public"."problem_progress"("userId", "isCorrect", "completedAt");

-- CreateIndex
CREATE INDEX "problem_progress_userId_studyId_lastAccessed_idx" ON "public"."problem_progress"("userId", "studyId", "lastAccessed");

-- CreateIndex
CREATE INDEX "problem_progress_userId_studyId_attemptNumber_completedAt_idx" ON "public"."problem_progress"("userId", "studyId", "attemptNumber", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "problem_progress_userId_studyId_problemId_attemptNumber_key" ON "public"."problem_progress"("userId", "studyId", "problemId", "attemptNumber");

-- CreateIndex
CREATE INDEX "attempts_userId_problemId_idx" ON "public"."attempts"("userId", "problemId");

-- CreateIndex
CREATE INDEX "attempts_userId_studyId_idx" ON "public"."attempts"("userId", "studyId");

-- CreateIndex
CREATE INDEX "attempts_problemId_idx" ON "public"."attempts"("problemId");

-- CreateIndex
CREATE INDEX "attempts_userId_studyId_attemptNumber_completedAt_idx" ON "public"."attempts"("userId", "studyId", "attemptNumber", "completedAt");

-- CreateIndex
CREATE INDEX "problem_assignments_classId_idx" ON "public"."problem_assignments"("classId");

-- CreateIndex
CREATE INDEX "problem_assignments_studentId_idx" ON "public"."problem_assignments"("studentId");

-- CreateIndex
CREATE INDEX "problem_assignments_assignedBy_idx" ON "public"."problem_assignments"("assignedBy");

-- CreateIndex
CREATE INDEX "problem_assignments_assignmentType_idx" ON "public"."problem_assignments"("assignmentType");

-- CreateIndex
CREATE INDEX "problem_assignments_status_idx" ON "public"."problem_assignments"("status");

-- CreateIndex
CREATE INDEX "problem_assignments_dueDate_idx" ON "public"."problem_assignments"("dueDate");

-- CreateIndex
CREATE INDEX "todos_userId_completed_idx" ON "public"."todos"("userId", "completed");

-- CreateIndex
CREATE INDEX "textbooks_subject_gradeLevel_idx" ON "public"."textbooks"("subject", "gradeLevel");

-- CreateIndex
CREATE INDEX "textbooks_processingStatus_idx" ON "public"."textbooks"("processingStatus");

-- CreateIndex
CREATE INDEX "textbooks_uploadedBy_idx" ON "public"."textbooks"("uploadedBy");

-- CreateIndex
CREATE INDEX "document_chunks_textbookId_idx" ON "public"."document_chunks"("textbookId");

-- CreateIndex
CREATE INDEX "document_chunks_embeddingId_idx" ON "public"."document_chunks"("embeddingId");

-- CreateIndex
CREATE INDEX "search_queries_userId_idx" ON "public"."search_queries"("userId");

-- CreateIndex
CREATE INDEX "search_queries_createdAt_idx" ON "public"."search_queries"("createdAt");

-- CreateIndex
CREATE INDEX "search_queries_userId_subject_createdAt_idx" ON "public"."search_queries"("userId", "subject", "createdAt");

-- CreateIndex
CREATE INDEX "search_queries_subject_gradeLevel_createdAt_idx" ON "public"."search_queries"("subject", "gradeLevel", "createdAt");

-- CreateIndex
CREATE INDEX "search_results_queryId_idx" ON "public"."search_results"("queryId");

-- CreateIndex
CREATE INDEX "search_results_chunkId_idx" ON "public"."search_results"("chunkId");

-- CreateIndex
CREATE INDEX "report_analyses_reportId_idx" ON "public"."report_analyses"("reportId");

-- CreateIndex
CREATE INDEX "report_analyses_analysisType_idx" ON "public"."report_analyses"("analysisType");

-- CreateIndex
CREATE INDEX "ai_server_status_serverName_idx" ON "public"."ai_server_status"("serverName");

-- CreateIndex
CREATE INDEX "ai_server_status_status_idx" ON "public"."ai_server_status"("status");

-- CreateIndex
CREATE INDEX "ai_server_status_lastChecked_idx" ON "public"."ai_server_status"("lastChecked");

-- CreateIndex
CREATE INDEX "ai_server_sync_serverName_idx" ON "public"."ai_server_sync"("serverName");

-- CreateIndex
CREATE INDEX "ai_server_sync_status_idx" ON "public"."ai_server_sync"("status");

-- CreateIndex
CREATE INDEX "ai_server_sync_startTime_idx" ON "public"."ai_server_sync"("startTime");

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_members" ADD CONSTRAINT "class_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_members" ADD CONSTRAINT "class_members_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problems" ADD CONSTRAINT "problems_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problems" ADD CONSTRAINT "problems_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "public"."textbooks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problems" ADD CONSTRAINT "problems_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_reports" ADD CONSTRAINT "teacher_reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_reports" ADD CONSTRAINT "teacher_reports_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_material_problems" ADD CONSTRAINT "learning_material_problems_learningMaterialId_fkey" FOREIGN KEY ("learningMaterialId") REFERENCES "public"."learning_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_material_problems" ADD CONSTRAINT "learning_material_problems_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_progress" ADD CONSTRAINT "problem_progress_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."learning_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_progress" ADD CONSTRAINT "problem_progress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_progress" ADD CONSTRAINT "problem_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempts" ADD CONSTRAINT "attempts_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."learning_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempts" ADD CONSTRAINT "attempts_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempts" ADD CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_assignments" ADD CONSTRAINT "problem_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_assignments" ADD CONSTRAINT "problem_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_assignments" ADD CONSTRAINT "problem_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."todos" ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."textbooks" ADD CONSTRAINT "textbooks_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_chunks" ADD CONSTRAINT "document_chunks_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "public"."textbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_queries" ADD CONSTRAINT "search_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_results" ADD CONSTRAINT "search_results_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "public"."document_chunks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_results" ADD CONSTRAINT "search_results_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "public"."search_queries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_analyses" ADD CONSTRAINT "report_analyses_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."teacher_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_server_sync" ADD CONSTRAINT "ai_server_sync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
