-- DropForeignKey
ALTER TABLE "public"."Pantangan" DROP CONSTRAINT "Pantangan_makananId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PengecualianMakanan" DROP CONSTRAINT "PengecualianMakanan_makananId_fkey";

-- AddForeignKey
ALTER TABLE "public"."PengecualianMakanan" ADD CONSTRAINT "PengecualianMakanan_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pantangan" ADD CONSTRAINT "Pantangan_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE CASCADE ON UPDATE CASCADE;
