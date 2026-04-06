'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileText, Trash2, Link2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MatchTransactionDialog } from './match-transaction-dialog';

interface UnprocessedReceipt {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date | string;
  uploadedBy: string;
}

interface UnprocessedReceiptsListProps {
  receipts: UnprocessedReceipt[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UnprocessedReceiptsList({ receipts: initial }: UnprocessedReceiptsListProps) {
  const router = useRouter();
  const [receipts, setReceipts] = useState(initial);
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const matchingReceipt = receipts.find((r) => r.id === matchingId) ?? null;

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setReceipts((prev) => prev.filter((r) => r.id !== id));
      toast.success('Receipt discarded');
      router.refresh();
    } catch {
      toast.error('Failed to delete receipt');
    } finally {
      setDeletingId(null);
    }
  }

  if (receipts.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No unprocessed receipts. All caught up!
      </p>
    );
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {receipts.map((receipt) => {
          const isImage = receipt.mimeType.startsWith('image/');
          return (
            <li key={receipt.id} className="overflow-hidden rounded-lg border bg-card">
              {/* Thumbnail */}
              <div className="flex h-40 items-center justify-center bg-muted">
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/receipts/${receipt.id}/file`}
                    alt={receipt.fileName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FileText className="size-12 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="space-y-3 p-3">
                <div>
                  <p className="truncate text-sm font-medium" title={receipt.fileName}>
                    {receipt.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(receipt.fileSize)} ·{' '}
                    {new Date(receipt.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="truncate text-xs text-muted-foreground" title={receipt.uploadedBy}>
                    {receipt.uploadedBy}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => setMatchingId(receipt.id)}>
                    <Link2 className="mr-1 size-3.5" />
                    Match
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="View / Download"
                    onClick={() => window.open(`/api/receipts/${receipt.id}/file`, '_blank')}
                  >
                    <Download className="size-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === receipt.id}
                        title="Discard receipt"
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Discard receipt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &ldquo;{receipt.fileName}&rdquo;. This cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(receipt.id)}
                        >
                          Discard
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {matchingReceipt && (
        <MatchTransactionDialog
          receiptId={matchingReceipt.id}
          receiptFileName={matchingReceipt.fileName}
          open={matchingId !== null}
          onOpenChange={(open) => {
            if (!open) setMatchingId(null);
          }}
          onMatched={() => {
            setReceipts((prev) => prev.filter((r) => r.id !== matchingId));
            setMatchingId(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
