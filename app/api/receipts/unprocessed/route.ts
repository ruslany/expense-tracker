import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getStorageProvider, makeReceiptStorageKey } from '@/lib/storage';
import { receiptUploadSchema } from '@/lib/validations';
import { requireAuth, requireAdmin } from '@/lib/authorization';

export async function GET() {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const receipts = await prisma.receipt.findMany({
      where: { transactionId: null },
      orderBy: { uploadedAt: 'asc' },
    });
    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching unprocessed receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch unprocessed receipts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;
  const { session } = authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validated = receiptUploadSchema.parse({
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });

    const receiptId = crypto.randomUUID();
    const storageKey = makeReceiptStorageKey(receiptId, validated.fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    await storage.upload(storageKey, buffer, validated.mimeType);

    const prisma = await getPrisma();
    const receipt = await prisma.receipt.create({
      data: {
        id: receiptId,
        transactionId: null,
        storageKey,
        fileName: validated.fileName,
        mimeType: validated.mimeType,
        fileSize: validated.fileSize,
        uploadedBy: session.user?.email ?? '',
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid file type or size' }, { status: 400 });
    }
    console.error('Error uploading unprocessed receipt:', error);
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
  }
}
