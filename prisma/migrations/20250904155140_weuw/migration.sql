-- CreateEnum
CREATE TYPE "public"."Jenis" AS ENUM ('Lauk', 'Sayur', 'Karbohidrat', 'Buah', 'Snack', 'Minuman');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('NURSE', 'KITCHEN', 'ADMIN', 'DIETISIEN');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateTable
CREATE TABLE "public"."User" (
    "idUser" SERIAL NOT NULL,
    "namaUser" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "public"."Pasien" (
    "idPasien" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "mr" TEXT NOT NULL,
    "namaPasien" TEXT NOT NULL,
    "tempatTidur" TEXT NOT NULL,
    "diagnosa" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL,
    "validate" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "validatedBy" INTEGER,

    CONSTRAINT "Pasien_pkey" PRIMARY KEY ("idPasien")
);

-- CreateTable
CREATE TABLE "public"."Makanan" (
    "idMakanan" SERIAL NOT NULL,
    "namaMakanan" TEXT NOT NULL,
    "jenis" "public"."Jenis" NOT NULL,
    "gambar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "menuId" INTEGER,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "Makanan_pkey" PRIMARY KEY ("idMakanan")
);

-- CreateTable
CREATE TABLE "public"."TanggalTersedia" (
    "idTanggal" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "makananId" INTEGER NOT NULL,

    CONSTRAINT "TanggalTersedia_pkey" PRIMARY KEY ("idTanggal")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "idMenu" SERIAL NOT NULL,
    "namaMenu" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("idMenu")
);

-- CreateTable
CREATE TABLE "public"."Pantangan" (
    "idPantangan" SERIAL NOT NULL,
    "namaPantangan" TEXT NOT NULL,
    "pasienId" INTEGER NOT NULL,
    "makananId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pantangan_pkey" PRIMARY KEY ("idPantangan")
);

-- CreateTable
CREATE TABLE "public"."Pesanan" (
    "idPesanan" SERIAL NOT NULL,
    "pasienId" INTEGER NOT NULL,
    "sesi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pesanan_pkey" PRIMARY KEY ("idPesanan")
);

-- CreateTable
CREATE TABLE "public"."PesananDetail" (
    "idPesananDetail" SERIAL NOT NULL,
    "pesananId" INTEGER NOT NULL,
    "makananId" INTEGER NOT NULL,

    CONSTRAINT "PesananDetail_pkey" PRIMARY KEY ("idPesananDetail")
);

-- CreateTable
CREATE TABLE "public"."_UtamaRelasi" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UtamaRelasi_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_namaUser_key" ON "public"."User"("namaUser");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_uuid_key" ON "public"."Pasien"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_mr_key" ON "public"."Pasien"("mr");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_link_key" ON "public"."Pasien"("link");

-- CreateIndex
CREATE INDEX "_UtamaRelasi_B_index" ON "public"."_UtamaRelasi"("B");

-- AddForeignKey
ALTER TABLE "public"."Pasien" ADD CONSTRAINT "Pasien_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pasien" ADD CONSTRAINT "Pasien_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "public"."User"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Makanan" ADD CONSTRAINT "Makanan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Makanan" ADD CONSTRAINT "Makanan_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("idMenu") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TanggalTersedia" ADD CONSTRAINT "TanggalTersedia_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Menu" ADD CONSTRAINT "Menu_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pantangan" ADD CONSTRAINT "Pantangan_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pantangan" ADD CONSTRAINT "Pantangan_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "public"."Pasien"("idPasien") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pesanan" ADD CONSTRAINT "Pesanan_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "public"."Pasien"("idPasien") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PesananDetail" ADD CONSTRAINT "PesananDetail_pesananId_fkey" FOREIGN KEY ("pesananId") REFERENCES "public"."Pesanan"("idPesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PesananDetail" ADD CONSTRAINT "PesananDetail_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UtamaRelasi" ADD CONSTRAINT "_UtamaRelasi_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Makanan"("idMakanan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UtamaRelasi" ADD CONSTRAINT "_UtamaRelasi_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Makanan"("idMakanan") ON DELETE CASCADE ON UPDATE CASCADE;
