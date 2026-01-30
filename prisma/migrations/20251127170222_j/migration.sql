/*
  Warnings:

  - The primary key for the `Total` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Total" DROP CONSTRAINT "Total_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT;
