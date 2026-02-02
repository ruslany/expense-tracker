import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPromise: Promise<PrismaClient> | undefined;
};

// Azure AD token scope for PostgreSQL
const AZURE_POSTGRES_SCOPE = 'https://ossrdbms-aad.database.windows.net/.default';

async function getAzureAccessToken(): Promise<string> {
  // Dynamic import to avoid bundling issues in non-Azure environments
  const { DefaultAzureCredential } = await import('@azure/identity');
  const credential = new DefaultAzureCredential({
    managedIdentityClientId: process.env.AZURE_CLIENT_ID,
  });
  const token = await credential.getToken(AZURE_POSTGRES_SCOPE);
  return token.token;
}

async function createPrismaClient(): Promise<PrismaClient> {
  const isAzure = !!process.env.AZURE_CLIENT_ID;
  const databaseUrl = process.env.DATABASE_URL!;

  let connectionString: string;
  let ssl: { rejectUnauthorized: boolean } | undefined;

  if (isAzure) {
    // Azure environment: embed Azure AD token in connection string
    // This matches the approach used in scripts/import-categories.ts
    const accessToken = await getAzureAccessToken();
    const url = new URL(databaseUrl);
    connectionString = `postgresql://${encodeURIComponent(url.username)}:${encodeURIComponent(accessToken)}@${url.hostname}:${url.port || 5432}${url.pathname}?sslmode=verify-full`;
    ssl = { rejectUnauthorized: true };
  } else if (databaseUrl.includes('azure')) {
    // Local development with Azure database (using az login)
    connectionString = databaseUrl;
    ssl = { rejectUnauthorized: true };
  } else {
    // Local development with local PostgreSQL
    connectionString = databaseUrl;
  }

  const pool = new Pool({ connectionString, ssl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/**
 * Get a Prisma client instance.
 * In Azure environment, this fetches an Azure AD token for authentication.
 * For local development, it uses the DATABASE_URL directly.
 */
export async function getPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (globalForPrisma.prismaPromise) {
    return globalForPrisma.prismaPromise;
  }

  globalForPrisma.prismaPromise = createPrismaClient().then((client) => {
    globalForPrisma.prisma = client;
    return client;
  });

  return globalForPrisma.prismaPromise;
}

// For backwards compatibility in local development without Azure
function createSyncPrismaClient(): PrismaClient {
  if (process.env.AZURE_CLIENT_ID) {
    throw new Error(
      'Cannot use synchronous prisma export in Azure environment. Use getPrisma() instead.'
    );
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('azure') ? { rejectUnauthorized: true } : undefined,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Export for backwards compatibility (local dev only)
// In Azure, this will be undefined - use getPrisma() instead
export const prisma: PrismaClient = process.env.AZURE_CLIENT_ID
  ? (undefined as unknown as PrismaClient)
  : (globalForPrisma.prisma ?? createSyncPrismaClient());

if (process.env.NODE_ENV !== 'production' && !process.env.AZURE_CLIENT_ID) {
  globalForPrisma.prisma = prisma;
}
