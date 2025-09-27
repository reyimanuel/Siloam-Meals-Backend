-- CreateTable
CREATE TABLE "public"."PengecualianMakanan" (
    "id" SERIAL NOT NULL,
    "pasienId" INTEGER NOT NULL,
    "makananId" INTEGER NOT NULL,

    CONSTRAINT "PengecualianMakanan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PengecualianMakanan_pasienId_makananId_key" ON "public"."PengecualianMakanan"("pasienId", "makananId");

-- AddForeignKey
ALTER TABLE "public"."PengecualianMakanan" ADD CONSTRAINT "PengecualianMakanan_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "public"."Pasien"("idPasien") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PengecualianMakanan" ADD CONSTRAINT "PengecualianMakanan_makananId_fkey" FOREIGN KEY ("makananId") REFERENCES "public"."Makanan"("idMakanan") ON DELETE RESTRICT ON UPDATE CASCADE;
