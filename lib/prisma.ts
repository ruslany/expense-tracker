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

  let poolConfig: {
    connectionString: string;
    ssl?: { rejectUnauthorized: boolean };
    password?: string;
  } = {
    connectionString: process.env.DATABASE_URL!,
  };

  if (isAzure) {
    // Azure environment: use Azure AD token as password
    const accessToken = await getAzureAccessToken();
    poolConfig = {
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: true },
      password: accessToken,
    };
  } else if (process.env.DATABASE_URL?.includes('azure')) {
    // Local development with Azure database (using az login)
    poolConfig.ssl = { rejectUnauthorized: true };
  }

  const pool = new Pool(poolConfig);
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
// This will throw if AZURE_CLIENT_ID is set (use getPrisma() instead)
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
export const prisma = globalForPrisma.prisma ?? createSyncPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
