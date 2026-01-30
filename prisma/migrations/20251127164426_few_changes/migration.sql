/*
  Warnings:

  - You are about to drop the `total` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "total";

-- CreateTable
CREATE TABLE "Total" (
    "id" UUID NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "user_product_unit_total" INTEGER,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "Total_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Total_item_id_key" ON "Total"("item_id");
