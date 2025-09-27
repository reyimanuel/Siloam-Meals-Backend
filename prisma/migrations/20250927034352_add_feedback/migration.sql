-- CreateTable
CREATE TABLE "public"."Feedback" (
    "idFeedback" SERIAL NOT NULL,
    "pasienId" INTEGER NOT NULL,
    "pengirimId" INTEGER NOT NULL,
    "penerimaId" INTEGER NOT NULL,
    "pesan" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("idFeedback")
);

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "public"."Pasien"("idPasien") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_pengirimId_fkey" FOREIGN KEY ("pengirimId") REFERENCES "public"."User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_penerimaId_fkey" FOREIGN KEY ("penerimaId") REFERENCES "public"."User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;
