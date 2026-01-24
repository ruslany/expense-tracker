-- AlterTable
ALTER TABLE "CSVMapping" ADD COLUMN     "skipPatterns" TEXT[] DEFAULT ARRAY[]::TEXT[];
