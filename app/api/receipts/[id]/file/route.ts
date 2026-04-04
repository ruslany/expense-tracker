import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getPrisma } from '@/lib/prisma';
import { getStorageProvider, getLocalFilePath } from '@/lib/storage';
import { requireAuth } from '@/lib/authorization';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;

    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const providerType = process.env.STORAGE_PROVIDER ?? 'local';

    if (providerType === 'azure') {
      const storage = getStorageProvider();
      const url = await storage.getDownloadUrl(receipt.storageKey);
      return NextResponse.redirect(url);
    }

    // Local: read file from disk and stream it
    const filePath = getLocalFilePath(receipt.storageKey);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': receipt.mimeType,
        'Content-Disposition': `inline; filename="${receipt.fileName}"`,
        'Content-Length': String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error('Error serving receipt file:', error);
    return NextResponse.json({ error: 'Failed to serve receipt' }, { status: 500 });
  }
}
