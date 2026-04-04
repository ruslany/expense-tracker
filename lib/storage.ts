import path from 'path';
import fs from 'fs/promises';

export interface StorageProvider {
  upload(key: string, data: Buffer, mimeType: string): Promise<void>;
  getDownloadUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Local file system provider (development / self-hosted)
// ---------------------------------------------------------------------------

class LocalFileStorageProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads', 'receipts');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upload(key: string, data: Buffer, _mimeType: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
  }

  // The actual file is served by GET /api/receipts/[id]/file.
  // Key is the receipt ID, so the URL uses that.
  async getDownloadUrl(key: string): Promise<string> {
    // key format: {transactionId}/{receiptId}-{filename}
    // extract the receiptId (second segment, before the first '-')
    const parts = key.split('/');
    const receiptId = parts[1]?.split('-')[0] ?? key;
    return `/api/receipts/${receiptId}/file`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    await fs.unlink(filePath).catch(() => {
      // Ignore if file doesn't exist
    });
  }

  getFilePath(key: string): string {
    return path.join(this.baseDir, key);
  }
}

// ---------------------------------------------------------------------------
// Azure Blob Storage provider (production)
// ---------------------------------------------------------------------------

class AzureBlobStorageProvider implements StorageProvider {
  private readonly accountName: string;
  private readonly containerName: string;

  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME ?? '';
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? 'receipts';

    if (!this.accountName) {
      throw new Error('AZURE_STORAGE_ACCOUNT_NAME is required when STORAGE_PROVIDER=azure');
    }
  }

  private async getContainerClient() {
    const { BlobServiceClient } = await import('@azure/storage-blob');
    const { DefaultAzureCredential } = await import('@azure/identity');

    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      credential,
    );
    return blobServiceClient.getContainerClient(this.containerName);
  }

  async upload(key: string, data: Buffer, mimeType: string): Promise<void> {
    const containerClient = await this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });
  }

  async getDownloadUrl(key: string): Promise<string> {
    const { generateBlobSASQueryParameters, BlobSASPermissions } =
      await import('@azure/storage-blob');
    const { DefaultAzureCredential } = await import('@azure/identity');

    const containerClient = await this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    // Generate a user delegation SAS (works with managed identity, no account key needed)
    const { BlobServiceClient } = await import('@azure/storage-blob');
    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      credential,
    );

    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + 15 * 60 * 1000); // 15 minutes

    const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);

    const sasQueryParams = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: key,
        permissions: BlobSASPermissions.parse('r'),
        startsOn,
        expiresOn,
      },
      userDelegationKey,
      this.accountName,
    );

    return `${blockBlobClient.url}?${sasQueryParams.toString()}`;
  }

  async delete(key: string): Promise<void> {
    const containerClient = await this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    await blockBlobClient.deleteIfExists();
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (_provider) return _provider;

  const providerType = process.env.STORAGE_PROVIDER ?? 'local';

  if (providerType === 'azure') {
    _provider = new AzureBlobStorageProvider();
  } else {
    _provider = new LocalFileStorageProvider();
  }

  return _provider;
}

// Exported for use in upload routes — generates a consistent storage key
export function makeReceiptStorageKey(
  receiptId: string,
  fileName: string,
  transactionId?: string,
): string {
  const dotIndex = fileName.lastIndexOf('.');
  const ext = dotIndex > 0 ? fileName.slice(dotIndex) : '';
  const base = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const safeFileName = base.slice(0, 100) + ext;
  const prefix = transactionId ?? 'unprocessed';
  return `${prefix}/${receiptId}-${safeFileName}`;
}

// Exported for use in the local file proxy route
export function getLocalFilePath(key: string): string {
  const provider = getStorageProvider();
  if (provider instanceof LocalFileStorageProvider) {
    return provider.getFilePath(key);
  }
  throw new Error('getLocalFilePath is only available for LocalFileStorageProvider');
}
