-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_learning_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedTime" INTEGER,
    "files" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_learning_materials" ("content", "createdAt", "deletedAt", "description", "difficulty", "estimatedTime", "files", "id", "isActive", "status", "subject", "title", "updatedAt") SELECT "content", "createdAt", "deletedAt", "description", "difficulty", "estimatedTime", "files", "id", "isActive", "status", "subject", "title", "updatedAt" FROM "learning_materials";
DROP TABLE "learning_materials";
ALTER TABLE "new_learning_materials" RENAME TO "learning_materials";
CREATE INDEX "learning_materials_subject_difficulty_isActive_idx" ON "learning_materials"("subject", "difficulty", "isActive");
CREATE INDEX "learning_materials_status_createdAt_idx" ON "learning_materials"("status", "createdAt");
CREATE INDEX "learning_materials_status_subject_createdAt_idx" ON "learning_materials"("status", "subject", "createdAt");
CREATE INDEX "learning_materials_deletedAt_idx" ON "learning_materials"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
