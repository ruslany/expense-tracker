import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPromise: Promise<PrismaClient> | undefined;
};

// Azure AD token scope for PostgreSQL
const AZURE_POSTGRES_SCOPE = 'https://ossrdbms-aad.database.windows.net/.default';

async function getAzureAccessToken(managedIdentityClientId?: string): Promise<string> {
  // Dynamic import to avoid bundling issues in non-Azure environments
  const { DefaultAzureCredential } = await import('@azure/identity');
  // With clientId: use managed identity (Azure environment)
  // Without clientId: use az login credentials (local dev)
  const credential = managedIdentityClientId
    ? new DefaultAzureCredential({ managedIdentityClientId })
    : new DefaultAzureCredential();
  const token = await credential.getToken(AZURE_POSTGRES_SCOPE);
  return token.token;
}

async function createPrismaClient(): Promise<PrismaClient> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const isAzureDb = databaseUrl.includes('azure');

  let connectionString: string;
  let ssl: { rejectUnauthorized: boolean } | undefined;

  if (process.env.AZURE_CLIENT_ID || isAzureDb) {
    // Azure environment (managed identity) or local dev with Azure database (az login)
    // Both require fetching an Azure AD token and embedding it in the connection string
    const accessToken = await getAzureAccessToken(process.env.AZURE_CLIENT_ID);
    const url = new URL(databaseUrl);
    connectionString = `postgresql://${encodeURIComponent(url.username)}:${encodeURIComponent(accessToken)}@${url.hostname}:${url.port || 5432}${url.pathname}?sslmode=verify-full`;
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
 * - In Azure (AZURE_CLIENT_ID set): uses managed identity to fetch Azure AD token
 * - Local dev with Azure DB: uses az login credentials to fetch Azure AD token
 * - Local dev with local DB: uses DATABASE_URL directly
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

// Check if we need Azure AD authentication (either in Azure or local dev with Azure DB)
const requiresAzureAuth = !!process.env.AZURE_CLIENT_ID || !!process.env.DATABASE_URL?.includes('azure');

// For backwards compatibility in local development with local PostgreSQL only
function createSyncPrismaClient(): PrismaClient {
  if (requiresAzureAuth) {
    throw new Error(
      'Cannot use synchronous prisma export with Azure database. Use getPrisma() instead.'
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Export for backwards compatibility (local dev with local PostgreSQL only)
// When using Azure database, this will be undefined - use getPrisma() instead
export const prisma: PrismaClient = requiresAzureAuth
  ? (undefined as unknown as PrismaClient)
  : (globalForPrisma.prisma ?? createSyncPrismaClient());

if (process.env.NODE_ENV !== 'production' && !requiresAzureAuth) {
  globalForPrisma.prisma = prisma;
}
