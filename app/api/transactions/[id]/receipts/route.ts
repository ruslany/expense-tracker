import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getStorageProvider } from '@/lib/storage';
import { receiptUploadSchema } from '@/lib/validations';
import { requireAdmin, requireAuth } from '@/lib/authorization';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;

    const receipts = await prisma.receipt.findMany({
      where: { transactionId: id },
      orderBy: { uploadedAt: 'asc' },
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id: transactionId } = await params;

    // Verify transaction exists
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

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
    const ext =
      validated.fileName.lastIndexOf('.') > 0
        ? validated.fileName.slice(validated.fileName.lastIndexOf('.'))
        : '';
    const base = validated.fileName.slice(
      0,
      validated.fileName.lastIndexOf('.') > 0
        ? validated.fileName.lastIndexOf('.')
        : validated.fileName.length,
    );
    const safeFileName = base.slice(0, 100) + ext;
    const storageKey = `${transactionId}/${receiptId}-${safeFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    await storage.upload(storageKey, buffer, validated.mimeType);

    const receipt = await prisma.receipt.create({
      data: {
        id: receiptId,
        transactionId,
        storageKey,
        fileName: validated.fileName,
        mimeType: validated.mimeType,
        fileSize: validated.fileSize,
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid file type or size' }, { status: 400 });
    }
    console.error('Error uploading receipt:', error);
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
  }
}
