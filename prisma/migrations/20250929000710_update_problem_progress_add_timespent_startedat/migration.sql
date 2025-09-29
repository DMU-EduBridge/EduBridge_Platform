/*
  Warnings:

  - You are about to drop the `study_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `attemptsCount` on the `attempts` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `attempts` table. All the data in the column will be lost.
  - You are about to drop the column `hintsUsed` on the `attempts` table. All the data in the column will be lost.
  - You are about to drop the column `studySessionId` on the `attempts` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `attempts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "study_sessions_createdAt_idx";

-- DropIndex
DROP INDEX "study_sessions_isCompleted_idx";

-- DropIndex
DROP INDEX "study_sessions_userId_studyId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "study_sessions";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "studyId" TEXT,
    "problemId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "selected" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attempts_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "learning_materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_attempts" ("completedAt", "createdAt", "id", "isCorrect", "problemId", "selected", "startedAt", "timeSpent", "userId") SELECT "completedAt", "createdAt", "id", "isCorrect", "problemId", "selected", "startedAt", coalesce("timeSpent", 0) AS "timeSpent", "userId" FROM "attempts";
DROP TABLE "attempts";
ALTER TABLE "new_attempts" RENAME TO "attempts";
CREATE INDEX "attempts_userId_problemId_idx" ON "attempts"("userId", "problemId");
CREATE INDEX "attempts_userId_studyId_idx" ON "attempts"("userId", "studyId");
CREATE INDEX "attempts_problemId_idx" ON "attempts"("problemId");
CREATE TABLE "new_problem_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "selectedAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "problem_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_progress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "problem_progress_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "learning_materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_problem_progress" ("attemptNumber", "completedAt", "createdAt", "id", "isCorrect", "lastAccessed", "problemId", "selectedAnswer", "studyId", "updatedAt", "userId") SELECT "attemptNumber", "completedAt", "createdAt", "id", "isCorrect", "lastAccessed", "problemId", "selectedAnswer", "studyId", "updatedAt", "userId" FROM "problem_progress";
DROP TABLE "problem_progress";
ALTER TABLE "new_problem_progress" RENAME TO "problem_progress";
CREATE INDEX "problem_progress_studyId_idx" ON "problem_progress"("studyId");
CREATE INDEX "problem_progress_userId_studyId_idx" ON "problem_progress"("userId", "studyId");
CREATE INDEX "problem_progress_userId_studyId_attemptNumber_idx" ON "problem_progress"("userId", "studyId", "attemptNumber");
CREATE UNIQUE INDEX "problem_progress_userId_studyId_problemId_attemptNumber_key" ON "problem_progress"("userId", "studyId", "problemId", "attemptNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
