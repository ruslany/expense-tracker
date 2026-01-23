import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSVFile, previewCSV, defaultMappings } from "@/lib/csv-parser";
import type { Institution } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const institution = formData.get("institution") as Institution;
    const accountId = formData.get("accountId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!institution) {
      return NextResponse.json(
        { error: "Institution is required" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Get or create CSV mapping
    let csvMapping = await prisma.cSVMapping.findUnique({
      where: { institution },
    });

    if (!csvMapping) {
      // Create default mapping if it doesn't exist
      const defaultConfig = defaultMappings[institution];
      csvMapping = await prisma.cSVMapping.create({
        data: {
          institution,
          fieldMapping: defaultConfig.fieldMapping,
          dateFormat: defaultConfig.dateFormat,
        },
      });
    }

    // Parse CSV
    const config = {
      institution,
      fieldMapping: csvMapping.fieldMapping as any,
      dateFormat: csvMapping.dateFormat,
    };

    const parsedTransactions = parseCSVFile(fileContent, config);
    const preview = previewCSV(fileContent, 5);

    // If accountId is provided, import the transactions
    if (accountId && parsedTransactions.length > 0) {
      const now = new Date();

      await prisma.transaction.createMany({
        data: parsedTransactions.map((tx) => ({
          accountId,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          merchant: tx.merchant,
          originalData: tx.originalData,
          importedAt: now,
        })),
      });

      // Create import history record
      await prisma.importHistory.create({
        data: {
          fileName: file.name,
          institution,
          accountId,
          rowsImported: parsedTransactions.length,
        },
      });

      return NextResponse.json({
        success: true,
        imported: parsedTransactions.length,
        preview,
      });
    }

    // Just return preview if no accountId
    return NextResponse.json({
      success: true,
      preview,
      parsedCount: parsedTransactions.length,
    });
  } catch (error) {
    console.error("Error uploading CSV:", error);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
