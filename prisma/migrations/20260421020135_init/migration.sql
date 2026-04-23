-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "rapat_type" TEXT NOT NULL DEFAULT 'with_reg';

-- CreateTable
CREATE TABLE "absensi" (
    "id" SERIAL NOT NULL,
    "rapat_id" TEXT NOT NULL,
    "participant_name" TEXT NOT NULL,
    "check_in_time" TEXT,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "division" TEXT,
    "signature_at_event" TEXT,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_rapat_id_fkey" FOREIGN KEY ("rapat_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
