/*
  Warnings:

  - A unique constraint covering the columns `[userId,user_product_item_id]` on the table `UserProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserProduct_user_product_item_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserProduct_userId_user_product_item_id_key" ON "UserProduct"("userId", "user_product_item_id");
