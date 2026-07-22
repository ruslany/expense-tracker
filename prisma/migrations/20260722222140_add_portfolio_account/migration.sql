-- CreateTable
CREATE TABLE "PortfolioAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxCategory" TEXT NOT NULL DEFAULT 'taxable',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioAccount_name_key" ON "PortfolioAccount"("name");
