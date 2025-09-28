-- DropForeignKey
ALTER TABLE "public"."Pesanan" DROP CONSTRAINT "Pesanan_pasienId_fkey";

-- AlterTable
ALTER TABLE "public"."Pesanan" ALTER COLUMN "pasienId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Pesanan" ADD CONSTRAINT "Pesanan_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "public"."Pasien"("idPasien") ON DELETE SET NULL ON UPDATE CASCADE;
