/*
  Warnings:

  - A unique constraint covering the columns `[item_id]` on the table `total` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `item_id` to the `total` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "total" ADD COLUMN     "item_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "total_item_id_key" ON "total"("item_id");
