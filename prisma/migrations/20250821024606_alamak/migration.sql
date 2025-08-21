-- CreateEnum
CREATE TYPE "public"."Jenis" AS ENUM ('Lauk', 'Sayur', 'Karbohidrat', 'Buah', 'Snack', 'Minuman');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('NURSE', 'KITCHEN', 'ADMIN', 'DIETISIEN');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pasien" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "Pasien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Makanan" (
    "id" SERIAL NOT NULL,
    "namaMakanan" TEXT NOT NULL,
    "jenis" "public"."Jenis" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "menuId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "Makanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "id" SERIAL NOT NULL,
    "namaMenu" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pantangan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "pasienId" INTEGER NOT NULL,
    "makananId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pantangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pesanan" (
    "id" SERIAL NOT NULL,
    "pasienId" INTEGER NOT NULL,
    "makananId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nama_key" ON "public"."User"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_mr_key" ON "public"."Pasien"("mr");

-- AddForeignKey
ALTER TABLE "public"."Pasien" ADD CONSTRAINT "Pasien_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pasien" ADD CONSTRAINT "Pasien_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Makanan" ADD CONSTRAINT "Makanan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Makanan" ADD CONSTRAINT "Makanan_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Menu" ADD CONSTRAINT "Menu_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pantangan" ADD CONSTRAINT "Pantangan_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pantangan" ADD CONSTRAINT "Pantangan_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "public"."Pasien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pesanan" ADD CONSTRAINT "Pesanan_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "public"."Pasien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pesanan" ADD CONSTRAINT "Pesanan_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
