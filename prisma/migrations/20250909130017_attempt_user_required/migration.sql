/*
  Warnings:

  - Made the column `userId` on table `attempts` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "selected" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_attempts" ("createdAt", "id", "isCorrect", "problemId", "selected", "userId") SELECT "createdAt", "id", "isCorrect", "problemId", "selected", "userId" FROM "attempts";
DROP TABLE "attempts";
ALTER TABLE "new_attempts" RENAME TO "attempts";
CREATE INDEX "attempts_userId_problemId_idx" ON "attempts"("userId", "problemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
