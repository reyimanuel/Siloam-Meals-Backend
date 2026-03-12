-- DropForeignKey
ALTER TABLE "public"."PesananDetail" DROP CONSTRAINT "PesananDetail_makananId_fkey";

-- AddForeignKey
ALTER TABLE "public"."PesananDetail" ADD CONSTRAINT "PesananDetail_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE CASCADE ON UPDATE CASCADE;
