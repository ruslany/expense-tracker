-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_transactionId_fkey";

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "uploadedBy" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "transactionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
