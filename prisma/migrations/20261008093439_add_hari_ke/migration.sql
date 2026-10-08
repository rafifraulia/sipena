-- AlterTable
ALTER TABLE "Absensi" ADD COLUMN     "hariKe" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Absensi_nik_idx" ON "Absensi"("nik");
