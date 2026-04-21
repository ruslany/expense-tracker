/*
  Warnings:

  - A unique constraint covering the columns `[symbol,accountName]` on the table `PortfolioItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PortfolioItem_symbol_key";

-- AlterTable
ALTER TABLE "PortfolioItem" ADD COLUMN     "accountName" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "PortfolioItem_accountName_idx" ON "PortfolioItem"("accountName");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioItem_symbol_accountName_key" ON "PortfolioItem"("symbol", "accountName");
