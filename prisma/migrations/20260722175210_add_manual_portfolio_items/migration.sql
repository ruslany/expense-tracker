-- AlterTable
ALTER TABLE "PortfolioItem" ADD COLUMN     "isManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manualPrice" DOUBLE PRECISION;
