import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { DefaultAzureCredential } from '@azure/identity';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createPrismaClient() {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken('https://ossrdbms-aad.database.windows.net/.default');

  const host = process.env.PROD_DB_HOST;
  const database = process.env.PROD_DB_NAME;
  const user = process.env.PROD_DB_USER;

  const connectionString = `postgresql://${encodeURIComponent(user!)}:${encodeURIComponent(token.token)}@${host}:5432/${database}?sslmode=verify-full`;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: true },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  return { prisma, pool };
}

interface CategoryRow {
  Keyword: string;
  Category: string;
}

async function importCategories() {
  const { prisma, pool } = await createPrismaClient();

  try {
    const csvPath = path.join(__dirname, '../sampledata/Categories.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const parsed = Papa.parse<CategoryRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
      return;
    }

    // Group keywords by category
    const categoryKeywords = new Map<string, string[]>();

    for (const row of parsed.data) {
      const category = row.Category?.trim();
      const keyword = row.Keyword?.trim();

      if (!category || !keyword) continue;

      if (!categoryKeywords.has(category)) {
        categoryKeywords.set(category, []);
      }
      categoryKeywords.get(category)!.push(keyword);
    }

    console.log(`Found ${categoryKeywords.size} unique categories`);

    // Insert categories
    for (const [name, keywords] of categoryKeywords) {
      try {
        await prisma.category.upsert({
          where: { name },
          update: { keywords },
          create: { name, keywords },
        });
        console.log(`✓ ${name}: ${keywords.length} keywords`);
      } catch (error) {
        console.error(`✗ Failed to import ${name}:`, error);
      }
    }

    console.log('\nImport complete!');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

importCategories().catch(console.error);
