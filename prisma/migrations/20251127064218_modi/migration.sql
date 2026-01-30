/*
  Warnings:

  - Added the required column `user_product_imageUrl` to the `UserProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProduct" ADD COLUMN     "user_product_imageUrl" TEXT NOT NULL;
