-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_parentId_idx" ON "Transaction"("parentId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
