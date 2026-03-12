-- DropForeignKey
ALTER TABLE "public"."TanggalTersedia" DROP CONSTRAINT "TanggalTersedia_makananId_fkey";

-- AddForeignKey
ALTER TABLE "public"."TanggalTersedia" ADD CONSTRAINT "TanggalTersedia_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE CASCADE ON UPDATE CASCADE;
