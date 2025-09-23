-- AlterTable
ALTER TABLE "users" ADD COLUMN "school" TEXT;
ALTER TABLE "users" ADD COLUMN "subject" TEXT;

-- CreateTable
CREATE TABLE "teacher_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "classInfo" TEXT NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "analysis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "teacher_reports_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "teacher_reports_teacherId_idx" ON "teacher_reports"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_reports_reportType_idx" ON "teacher_reports"("reportType");

-- CreateIndex
CREATE INDEX "teacher_reports_status_idx" ON "teacher_reports"("status");

-- CreateIndex
CREATE INDEX "teacher_reports_createdAt_idx" ON "teacher_reports"("createdAt");

-- CreateIndex
CREATE INDEX "teacher_reports_teacherId_reportType_status_createdAt_idx" ON "teacher_reports"("teacherId", "reportType", "status", "createdAt");

-- CreateIndex
CREATE INDEX "teacher_reports_deletedAt_idx" ON "teacher_reports"("deletedAt");

-- CreateIndex
CREATE INDEX "analysis_reports_studentId_type_status_createdAt_idx" ON "analysis_reports"("studentId", "type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "learning_materials_status_subject_createdAt_idx" ON "learning_materials"("status", "subject", "createdAt");
