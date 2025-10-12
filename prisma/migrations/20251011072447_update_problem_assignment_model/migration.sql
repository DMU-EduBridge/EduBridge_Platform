/*
  Warnings:

  - You are about to drop the column `isActive` on the `problem_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `problemId` on the `problem_assignments` table. All the data in the column will be lost.
  - Added the required column `problemIds` to the `problem_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `problem_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `problem_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_problem_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignmentType" TEXT NOT NULL DEFAULT 'HOMEWORK',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "classId" TEXT,
    "studentId" TEXT,
    "problemIds" JSONB NOT NULL,
    "dueDate" DATETIME,
    "instructions" TEXT,
    "metadata" JSONB,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "problem_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_problem_assignments" ("assignedAt", "assignedBy", "classId", "dueDate", "id", "instructions") SELECT "assignedAt", "assignedBy", "classId", "dueDate", "id", "instructions" FROM "problem_assignments";
DROP TABLE "problem_assignments";
ALTER TABLE "new_problem_assignments" RENAME TO "problem_assignments";
CREATE INDEX "problem_assignments_classId_idx" ON "problem_assignments"("classId");
CREATE INDEX "problem_assignments_studentId_idx" ON "problem_assignments"("studentId");
CREATE INDEX "problem_assignments_assignedBy_idx" ON "problem_assignments"("assignedBy");
CREATE INDEX "problem_assignments_assignmentType_idx" ON "problem_assignments"("assignmentType");
CREATE INDEX "problem_assignments_status_idx" ON "problem_assignments"("status");
CREATE INDEX "problem_assignments_dueDate_idx" ON "problem_assignments"("dueDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
