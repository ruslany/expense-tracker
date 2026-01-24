import Papa from "papaparse";
import { parse, startOfDay } from "date-fns";
import type { CSVFieldMapping, ParsedTransaction, Institution } from "@/types";

export interface CSVParserConfig {
  institution: Institution;
  fieldMapping: CSVFieldMapping;
  dateFormat: string;
}

// Default mappings for known institutions
export const defaultMappings: Record<Institution, CSVParserConfig> = {
  fidelity: {
    institution: "fidelity",
    fieldMapping: {
      date: "Date",
      description: "Name",
      amount: "Amount",
      transactionType: "Transaction",
      memo: "Memo",
    },
    dateFormat: "yyyy-MM-dd",
  },
  citi: {
    institution: "citi",
    fieldMapping: {
      status: "Status",
      date: "Date",
      description: "Description",
      debit: "Debit",
      credit: "Credit",
    },
    dateFormat: "MM/dd/yyyy",
  },
  amex: {
    institution: "amex",
    fieldMapping: {
      date: "Date",
      description: "Description",
      cardMember: "Card Member",
      accountNumber: "Account #",
      amount: "Amount",
    },
    dateFormat: "MM/dd/yyyy",
  },
};

export function parseCSVFile(
  fileContent: string,
  config: CSVParserConfig
): ParsedTransaction[] {
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
      transactions.push(transaction);
    } catch (error) {
      console.error("Error parsing row:", row, error);
      // Continue with next row instead of failing entire import
    }
  }

  return transactions;
}

function parseTransaction(
  row: Record<string, string>,
  config: CSVParserConfig
): ParsedTransaction {
  const { fieldMapping, dateFormat } = config;

  // Parse date
  const dateStr = row[fieldMapping.date];
  if (!dateStr) {
    throw new Error("Date field is missing");
  }
  const date = parse(dateStr, dateFormat, startOfDay(new Date()));

  // Parse description
  const description = row[fieldMapping.description] || "Unknown";

  // Parse amount - handle different formats (debit/credit columns or single amount column)
  let amount = 0;

  if (fieldMapping.amount && row[fieldMapping.amount]) {
    // Single amount column
    amount = parseAmount(row[fieldMapping.amount]);
  } else if (fieldMapping.debit && fieldMapping.credit) {
    // Separate debit/credit columns (Citi format)
    const debit = row[fieldMapping.debit] ? parseAmount(row[fieldMapping.debit]) : 0;
    const credit = row[fieldMapping.credit] ? parseAmount(row[fieldMapping.credit]) : 0;
    amount = credit - debit; // Credits are positive, debits are negative
  }

  return {
    date,
    description,
    amount,
    originalData: row,
  };
}

function parseAmount(amountStr: string): number {
  // Remove currency symbols, commas, and whitespace
  const cleaned = amountStr.replace(/[$,\s]/g, "");

  // Handle parentheses notation for negative numbers
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    return -parseFloat(cleaned.slice(1, -1));
  }

  return parseFloat(cleaned);
}

export function validateCSVHeaders(
  fileContent: string,
  expectedMapping: CSVFieldMapping
): { isValid: boolean; missingHeaders: string[] } {
  const parseResult = Papa.parse(fileContent, {
    header: true,
    preview: 1,
  });

  const headers = parseResult.meta.fields || [];
  const expectedHeaders = Object.values(expectedMapping).filter(Boolean);
  const missingHeaders = expectedHeaders.filter(
    (header) => !headers.includes(header)
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
  };
}

export function previewCSV(
  fileContent: string,
  rowCount: number = 5
): Record<string, string>[] {
  const parseResult = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    preview: rowCount,
    skipEmptyLines: true,
  });

  return parseResult.data;
}
