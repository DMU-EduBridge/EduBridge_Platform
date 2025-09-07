/*
  Warnings:

  - You are about to drop the `answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subjects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `content` on the `analysis_reports` table. All the data in the column will be lost.
  - You are about to drop the column `learningPattern` on the `analysis_reports` table. All the data in the column will be lost.
  - You are about to drop the column `overallScore` on the `analysis_reports` table. All the data in the column will be lost.
  - You are about to drop the column `periodEnd` on the `analysis_reports` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `analysis_reports` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `analysis_reports` table. All the data in the column will be lost.
  - You are about to drop the column `personalityAnalysis` on the `career_counseling` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `learning_materials` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `learning_materials` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `learning_materials` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `problems` table. All the data in the column will be lost.
  - You are about to drop the column `lastAccessed` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `materialId` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `users` table. All the data in the column will be lost.
  - Added the required column `period` to the `analysis_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `analysis_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `learning_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `learning_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `problems` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "answers_studentId_problemId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "answers";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "classes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "messages";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "notifications";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "subjects";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analysis_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_analysis_reports" ("createdAt", "id", "insights", "recommendations", "strengths", "studentId", "title", "weaknesses") SELECT "createdAt", "id", "insights", "recommendations", "strengths", "studentId", "title", "weaknesses" FROM "analysis_reports";
DROP TABLE "analysis_reports";
ALTER TABLE "new_analysis_reports" RENAME TO "analysis_reports";
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "career_counseling_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_career_counseling" ("careerSuggestions", "content", "createdAt", "id", "skillGaps", "studentId", "title", "type", "universityRecommendations") SELECT "careerSuggestions", "content", "createdAt", "id", "skillGaps", "studentId", "title", "type", "universityRecommendations" FROM "career_counseling";
DROP TABLE "career_counseling";
ALTER TABLE "new_career_counseling" RENAME TO "career_counseling";
CREATE TABLE "new_learning_materials" (
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_learning_materials" ("content", "createdAt", "difficulty", "estimatedTime", "id", "title", "updatedAt") SELECT "content", "createdAt", "difficulty", "estimatedTime", "id", "title", "updatedAt" FROM "learning_materials";
DROP TABLE "learning_materials";
ALTER TABLE "new_learning_materials" RENAME TO "learning_materials";
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_problems" ("content", "correctAnswer", "createdAt", "difficulty", "explanation", "hints", "id", "options", "points", "tags", "timeLimit", "title", "type", "updatedAt") SELECT "content", "correctAnswer", "createdAt", "difficulty", "explanation", "hints", "id", "options", "points", "tags", "timeLimit", "title", "type", "updatedAt" FROM "problems";
DROP TABLE "problems";
ALTER TABLE "new_problems" RENAME TO "problems";
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
    CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_student_progress" ("createdAt", "id", "status", "studentId", "timeSpent", "updatedAt") SELECT "createdAt", "id", "status", "studentId", "timeSpent", "updatedAt" FROM "student_progress";
DROP TABLE "student_progress";
ALTER TABLE "new_student_progress" RENAME TO "student_progress";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "grade" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "bio", "createdAt", "email", "grade", "id", "name", "role", "updatedAt") SELECT "avatar", "bio", "createdAt", "email", "grade", "id", "name", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
