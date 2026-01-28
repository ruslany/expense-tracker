import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCSVFile, previewCSV, defaultMappings, detectCategory } from '@/lib/csv-parser';
import { computeContentHash } from '@/lib/utils';
import type { CSVFieldMapping, Institution, ParsedTransaction } from '@/types';
import type { Prisma } from '@/lib/generated/prisma/client';

function computeSequencedHashes(transactions: ParsedTransaction[]): string[] {
  const baseHashCounts = new Map<string, number>();

  return transactions.map((tx) => {
    const baseHash = computeContentHash(tx.originalData);
    const sequence = baseHashCounts.get(baseHash) ?? 0;
    baseHashCounts.set(baseHash, sequence + 1);
    return computeContentHash({ ...tx.originalData, _seq: sequence });
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const institution = formData.get('institution') as Institution;
    const accountId = formData.get('accountId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!institution) {
      return NextResponse.json({ error: 'Institution is required' }, { status: 400 });
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
          fieldMapping: defaultConfig.fieldMapping as unknown as Prisma.InputJsonValue,
          dateFormat: defaultConfig.dateFormat,
          invertAmount: defaultConfig.invertAmount,
          skipPatterns: defaultConfig.skipPatterns ?? [],
        },
      });
    }

    // Parse CSV
    const config = {
      institution,
      fieldMapping: csvMapping.fieldMapping as unknown as CSVFieldMapping,
      dateFormat: csvMapping.dateFormat,
      invertAmount: csvMapping.invertAmount,
      skipPatterns: csvMapping.skipPatterns,
    };

    const parsedTransactions = parseCSVFile(fileContent, config);
    const preview = previewCSV(fileContent, 5);

    // If accountId is provided, import the transactions
    if (accountId && parsedTransactions.length > 0) {
      const now = new Date();

      // Fetch categories for automatic category detection
      const categories = await prisma.category.findMany({
        select: { id: true, name: true, keywords: true },
      });

      // Build a map of category names to IDs for CSV-provided categories
      const categoryNameToId = new Map(
        categories.map((c) => [c.name.toLowerCase(), c.id])
      );

      // Compute hashes with sequence numbers for identical rows
      const contentHashes = computeSequencedHashes(parsedTransactions);

      const result = await prisma.transaction.createMany({
        data: parsedTransactions.map((tx, index) => ({
          accountId,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          categoryId: tx.category
            ? categoryNameToId.get(tx.category.toLowerCase()) ?? null
            : detectCategory(tx.description, categories),
          originalData: tx.originalData as Prisma.InputJsonValue,
          contentHash: contentHashes[index],
          importedAt: now,
        })),
        skipDuplicates: true,
      });

      const importedCount = result.count;
      const skippedCount = parsedTransactions.length - importedCount;

      // Create import history record
      await prisma.importHistory.create({
        data: {
          fileName: file.name,
          institution,
          accountId,
          rowsImported: importedCount,
        },
      });

      return NextResponse.json({
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: parsedTransactions.length,
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
    console.error('Error uploading CSV:', error);
    return NextResponse.json({ error: 'Failed to process CSV file' }, { status: 500 });
  }
}
