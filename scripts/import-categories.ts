import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CategoryRow {
  Keyword: string;
  Category: string;
}

async function importCategories() {
  const csvPath = path.join(__dirname, "../sampledata/Categories.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const parsed = Papa.parse<CategoryRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parsing errors:", parsed.errors);
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

  console.log("\nImport complete!");
}

importCategories()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
