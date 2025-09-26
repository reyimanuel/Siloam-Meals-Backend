/*
  Warnings:

  - You are about to drop the column `tempatTidur` on the `Pasien` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[noKtp]` on the table `Pasien` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Pasien" DROP COLUMN "tempatTidur",
ADD COLUMN     "noKtp" TEXT,
ADD COLUMN     "ruanganInap" TEXT NOT NULL DEFAULT 'default_value',
ADD COLUMN     "tanggalLahir" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_noKtp_key" ON "public"."Pasien"("noKtp");
