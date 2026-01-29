import Papa from 'papaparse';
import { parse, startOfDay } from 'date-fns';
import type { CSVFieldMapping, ParsedTransaction, Institution } from '@/types';

export interface CSVParserConfig {
  institution: Institution;
  fieldMapping: CSVFieldMapping;
  dateFormat: string;
  invertAmount: boolean;
  skipPatterns?: string[];
}

// Default mappings for known institutions
export const defaultMappings: Record<Institution, CSVParserConfig> = {
  fidelity: {
    institution: 'fidelity',
    fieldMapping: {
      date: 'Date',
      description: 'Name',
      amount: 'Amount',
      transactionType: 'Transaction',
      memo: 'Memo',
    },
    dateFormat: 'yyyy-MM-dd',
    invertAmount: false, // Fidelity shows expenses as negative
    skipPatterns: ['INTERNET PAYMENT THANK YOU'],
  },
  citi: {
    institution: 'citi',
    fieldMapping: {
      status: 'Status',
      date: 'Date',
      description: 'Description',
      debit: 'Debit',
      credit: 'Credit',
    },
    dateFormat: 'MM/dd/yyyy',
    invertAmount: false, // Uses debit/credit columns, already handled correctly
    skipPatterns: ['ONLINE PAYMENT, THANK YOU'],
  },
  amex: {
    institution: 'amex',
    fieldMapping: {
      date: 'Date',
      description: 'Description',
      cardMember: 'Card Member',
      accountNumber: 'Account #',
      amount: 'Amount',
    },
    dateFormat: 'MM/dd/yyyy',
    invertAmount: true, // AMEX shows expenses as positive, need to invert
    skipPatterns: ['ONLINE PAYMENT - THANK YOU'],
  },
};

export function parseCSVFile(fileContent: string, config: CSVParserConfig): ParsedTransaction[] {
  const parseResult = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parseResult.errors.length > 0) {
    throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`);
  }

  const transactions: ParsedTransaction[] = [];

  for (const row of parseResult.data) {
    try {
      const transaction = parseTransaction(row, config);

      // Skip transactions matching any skip pattern
      const shouldSkip = config.skipPatterns?.some((pattern) =>
        transaction.description.toUpperCase().includes(pattern.toUpperCase()),
      );
      if (shouldSkip) {
        continue;
      }

      transactions.push(transaction);
    } catch (error) {
      console.error('Error parsing row:', row, error);
      // Continue with next row instead of failing entire import
    }
  }

  return transactions;
}

function parseTransaction(row: Record<string, string>, config: CSVParserConfig): ParsedTransaction {
  const { fieldMapping, dateFormat } = config;

  // Parse date
  const dateStr = row[fieldMapping.date];
  if (!dateStr) {
    throw new Error('Date field is missing');
  }
  const parsedDate = parse(dateStr, dateFormat, startOfDay(new Date()));
  // Convert to UTC midnight to avoid timezone offset issues
  const date = new Date(
    Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
  );

  // Parse description
  const description = row[fieldMapping.description] || 'Unknown';

  // Parse amount - handle different formats (debit/credit columns or single amount column)
  let amount = 0;

  if (fieldMapping.amount && row[fieldMapping.amount]) {
    // Single amount column
    amount = parseAmount(row[fieldMapping.amount]);
  } else if (fieldMapping.debit && fieldMapping.credit) {
    // Separate debit/credit columns (Citi format)
    const debit = row[fieldMapping.debit] ? parseAmount(row[fieldMapping.debit]) : 0;
    // Costco credit column always has negative numbers
    const credit = row[fieldMapping.credit] ? parseAmount(row[fieldMapping.credit]) * -1 : 0;
    amount = credit - debit; // Credits are positive, debits are negative
  }

  // Invert amount if needed (some institutions show expenses as positive)
  if (config.invertAmount) {
    amount = -amount;
  }

  // Parse category if present in CSV (check explicit mapping first, then common column names)
  let category: string | undefined;
  if (fieldMapping.category && row[fieldMapping.category]) {
    category = row[fieldMapping.category].trim();
  } else {
    // Auto-detect common category column names
    const categoryColumnNames = ['Category', 'category', 'CATEGORY'];
    for (const colName of categoryColumnNames) {
      if (row[colName]) {
        category = row[colName].trim();
        break;
      }
    }
  }

  // Parse tags if present in CSV (auto-detect common tag column names)
  let tags: string[] | undefined;
  const tagColumnNames = ['Tag', 'tag', 'TAG', 'Tags', 'tags', 'TAGS'];
  for (const colName of tagColumnNames) {
    if (row[colName]) {
      // Split by comma or semicolon to support multiple tags in one cell
      tags = row[colName]
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      break;
    }
  }

  return {
    date,
    description,
    amount,
    originalData: row,
    ...(category && { category }),
    ...(tags && tags.length > 0 && { tags }),
  };
}

function parseAmount(amountStr: string): number {
  // Remove currency symbols, commas, and whitespace
  const cleaned = amountStr.replace(/[$,\s]/g, '');

  // Handle parentheses notation for negative numbers
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.slice(1, -1));
  }

  return parseFloat(cleaned);
}

export interface CategoryWithKeywords {
  id: string;
  name: string;
  keywords: string[];
}

/**
 * Detects the category for a transaction based on keyword matching.
 * Returns the category ID if a match is found, null otherwise.
 *
 * Matching is case-insensitive and checks if any keyword is contained
 * in the transaction description.
 */
export function detectCategory(
  description: string,
  categories: CategoryWithKeywords[],
): string | null {
  const descriptionLower = description.toLowerCase();

  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (keyword && descriptionLower.includes(keyword.toLowerCase())) {
        return category.id;
      }
    }
  }

  return null;
}

export function validateCSVHeaders(
  fileContent: string,
  expectedMapping: CSVFieldMapping,
): { isValid: boolean; missingHeaders: string[] } {
  const parseResult = Papa.parse(fileContent, {
    header: true,
    preview: 1,
  });

  const headers = parseResult.meta.fields || [];
  const expectedHeaders = Object.values(expectedMapping).filter(Boolean);
  const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header));

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
  };
}

export function previewCSV(fileContent: string, rowCount: number = 5): Record<string, string>[] {
  const parseResult = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    preview: rowCount,
    skipEmptyLines: true,
  });

  return parseResult.data;
}
