-- DropForeignKey
ALTER TABLE "public"."PesananDetail" DROP CONSTRAINT "PesananDetail_makananId_fkey";

-- AlterTable
ALTER TABLE "Pesanan" ADD COLUMN     "diagnosaHistory" TEXT,
ADD COLUMN     "mrHistory" TEXT,
ADD COLUMN     "ruanganInapHistory" TEXT;

-- AlterTable
ALTER TABLE "PesananDetail" ADD COLUMN     "jenisHistory" "Jenis",
ADD COLUMN     "namaMakananHistory" TEXT,
ALTER COLUMN "makananId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PesananDetail" ADD CONSTRAINT "PesananDetail_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "Makanan"("idMakanan") ON DELETE SET NULL ON UPDATE CASCADE;
