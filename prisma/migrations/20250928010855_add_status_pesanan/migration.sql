-- CreateEnum
CREATE TYPE "public"."StatusPesanan" AS ENUM ('PENDING', 'SELESAI', 'DITERIMA', 'BATAL');

-- AlterTable
ALTER TABLE "public"."Pesanan" ADD COLUMN     "namaPasienHistory" TEXT,
ADD COLUMN     "status" "public"."StatusPesanan" NOT NULL DEFAULT 'PENDING';
