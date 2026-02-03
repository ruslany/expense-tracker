import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import type { AccessToken, DefaultAzureCredential as DefaultAzureCredentialType } from '@azure/identity';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPromise: Promise<PrismaClient> | undefined;
  tokenManager: AzureTokenManager | undefined;
};

// Azure AD token scope for PostgreSQL
const AZURE_POSTGRES_SCOPE = 'https://ossrdbms-aad.database.windows.net/.default';

/**
 * Manages Azure AD tokens with caching and automatic refresh.
 * Tokens are refreshed when they expire within 5 minutes.
 */
class AzureTokenManager {
  private credential: DefaultAzureCredentialType | null = null;
  private cachedToken: AccessToken | null = null;
  private managedIdentityClientId?: string;

  constructor(managedIdentityClientId?: string) {
    this.managedIdentityClientId = managedIdentityClientId;
  }

  private async ensureCredential(): Promise<DefaultAzureCredentialType> {
    if (!this.credential) {
      const { DefaultAzureCredential } = await import('@azure/identity');
      this.credential = this.managedIdentityClientId
        ? new DefaultAzureCredential({ managedIdentityClientId: this.managedIdentityClientId })
        : new DefaultAzureCredential();
    }
    return this.credential;
  }

  async getToken(): Promise<string> {
    // Refresh if token expires in less than 5 minutes
    const bufferMs = 5 * 60 * 1000;
    if (!this.cachedToken || this.cachedToken.expiresOnTimestamp < Date.now() + bufferMs) {
      const credential = await this.ensureCredential();
      this.cachedToken = await credential.getToken(AZURE_POSTGRES_SCOPE);
    }
    return this.cachedToken.token;
  }
}

function getTokenManager(managedIdentityClientId?: string): AzureTokenManager {
  if (!globalForPrisma.tokenManager) {
    globalForPrisma.tokenManager = new AzureTokenManager(managedIdentityClientId);
  }
  return globalForPrisma.tokenManager;
}

async function createPrismaClient(): Promise<PrismaClient> {
  const databaseUrl = process.env.DATABASE_URL!;
  const isAzureDb = databaseUrl.includes('azure');

  let pool: Pool;

  if (process.env.AZURE_CLIENT_ID || isAzureDb) {
    // Azure environment (managed identity) or local dev with Azure database (az login)
    // Use async password function for automatic token refresh on each new connection
    const url = new URL(databaseUrl);
    const tokenManager = getTokenManager(process.env.AZURE_CLIENT_ID);

    pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: () => tokenManager.getToken(), // pg 8.x supports async password
      ssl: { rejectUnauthorized: true },
    });
  } else {
    // Local development with local PostgreSQL
    pool = new Pool({ connectionString: databaseUrl });
  }

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
