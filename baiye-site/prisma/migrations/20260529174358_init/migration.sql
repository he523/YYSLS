-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT '小猫咪',
    "profession" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "power" INTEGER NOT NULL DEFAULT 0,
    "intro" TEXT,
    "game_image" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
