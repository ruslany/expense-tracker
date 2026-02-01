import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  institution: z.string().min(1, 'Institution is required'),
  accountType: z.string().min(1, 'Account type is required'),
});

export const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  date: z.coerce.date(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number(),
  categoryId: z.string().optional(),
  originalData: z.record(z.string(), z.unknown()),
  importedAt: z.coerce.date(),
});

export const csvMappingSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  fieldMapping: z.record(z.string(), z.string()),
  dateFormat: z.string().min(1, 'Date format is required'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  keywords: z.array(z.string()).optional(),
});

export const transactionUpdateSchema = z.object({
  categoryId: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required').optional(),
  date: z.coerce.date().optional(),
  amount: z.number().optional(),
});

export const transactionFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const csvUploadSchema = z.object({
  institution: z.enum(['fidelity', 'citi', 'amex']),
  accountId: z.string().min(1, 'Account ID is required'),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long'),
});

export const transactionTagsUpdateSchema = z.object({
  tagIds: z.array(z.string()),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  keywords: z.array(z.string()).optional(),
});
