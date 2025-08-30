/*
  Warnings:

  - A unique constraint covering the columns `[pohodaId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pohodaId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pohodaId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pohodaId]` on the table `TransactionItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "pohodaId" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "pohodaId" TEXT;

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "pohodaId" TEXT;

-- AlterTable
ALTER TABLE "public"."TransactionItem" ADD COLUMN     "pohodaId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_pohodaId_key" ON "public"."Client"("pohodaId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_pohodaId_key" ON "public"."Product"("pohodaId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_pohodaId_key" ON "public"."Transaction"("pohodaId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionItem_pohodaId_key" ON "public"."TransactionItem"("pohodaId");
