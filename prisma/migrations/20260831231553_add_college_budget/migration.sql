-- CreateTable
CREATE TABLE "CollegeBudget" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "academicYearStart" TIMESTAMP(3) NOT NULL,
    "academicYearEnd" TIMESTAMP(3) NOT NULL,
    "tagId" TEXT NOT NULL,
    "limitAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeBudget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollegeBudget_tagId_idx" ON "CollegeBudget"("tagId");

-- AddForeignKey
ALTER TABLE "CollegeBudget" ADD CONSTRAINT "CollegeBudget_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
