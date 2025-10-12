-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_learning_material_problems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learningMaterialId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learning_material_problems_learningMaterialId_fkey" FOREIGN KEY ("learningMaterialId") REFERENCES "learning_materials" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "learning_material_problems_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_learning_material_problems" ("createdAt", "id", "learningMaterialId", "problemId") SELECT "createdAt", "id", "learningMaterialId", "problemId" FROM "learning_material_problems";
DROP TABLE "learning_material_problems";
ALTER TABLE "new_learning_material_problems" RENAME TO "learning_material_problems";
CREATE INDEX "learning_material_problems_learningMaterialId_idx" ON "learning_material_problems"("learningMaterialId");
CREATE INDEX "learning_material_problems_problemId_idx" ON "learning_material_problems"("problemId");
CREATE INDEX "learning_material_problems_learningMaterialId_order_idx" ON "learning_material_problems"("learningMaterialId", "order");
CREATE UNIQUE INDEX "learning_material_problems_learningMaterialId_problemId_key" ON "learning_material_problems"("learningMaterialId", "problemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
