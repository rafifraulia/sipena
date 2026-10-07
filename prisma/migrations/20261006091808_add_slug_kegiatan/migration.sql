/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Kegiatan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Kegiatan` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add column with default value for existing rows
ALTER TABLE "Kegiatan" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

-- Step 2: Update existing rows with unique slugs
UPDATE "Kegiatan" SET "slug" = LOWER(SUBSTRING(MD5(RANDOM()::TEXT || id) FROM 1 FOR 6));

-- Step 3: Remove default value (new rows must provide slug)
ALTER TABLE "Kegiatan" ALTER COLUMN "slug" DROP DEFAULT;

-- Step 4: Create unique index
CREATE UNIQUE INDEX "Kegiatan_slug_key" ON "Kegiatan"("slug");

