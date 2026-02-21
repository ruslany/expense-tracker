-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- Backfill: mark all existing transactions as reviewed (they are already known/in-use)
UPDATE "Transaction" SET "reviewedAt" = "importedAt";

-- CreateIndex
CREATE INDEX "Transaction_reviewedAt_idx" ON "Transaction"("reviewedAt");
