-- CreateTable
CREATE TABLE "total" (
    "id" UUID NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "user_product_unit_total" INTEGER,

    CONSTRAINT "total_pkey" PRIMARY KEY ("id")
);
