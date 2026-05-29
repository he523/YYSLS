-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT '小猫咪',
    "profession" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "power" INTEGER NOT NULL DEFAULT 0,
    "intro" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "game_image" TEXT,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);
