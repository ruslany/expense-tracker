'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Paperclip, Trash2, Download, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';

interface Receipt {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

interface ReceiptsDialogProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReceiptsDialog({ transactionId, open, onOpenChange }: ReceiptsDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReceipts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/receipts`);
      if (!res.ok) throw new Error('Failed to load receipts');
      setReceipts(await res.json());
    } catch {
      toast.error('Failed to load receipts');
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (!open) return;
    setSelectedFile(null);
    fetchReceipts();
  }, [open, fetchReceipts]);

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/transactions/${transactionId}/receipts`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('Receipt uploaded');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchReceipts();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(receiptId: string) {
    setDeletingId(receiptId);
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Receipt deleted');
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      router.refresh();
    } catch {
      toast.error('Failed to delete receipt');
    } finally {
      setDeletingId(null);
    }
  }

  function handleDownload(receiptId: string) {
    window.open(`/api/receipts/${receiptId}/file`, '_blank');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="size-4" />
            Receipts
          </DialogTitle>
          <DialogDescription>Attached receipts for this transaction.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt list */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : receipts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No receipts attached yet.</p>
          ) : (
            <ul className="space-y-2">
              {receipts.map((receipt) => {
                const isImage = receipt.mimeType.startsWith('image/');
                return (
                  <li key={receipt.id} className="rounded-md border">
                    {isImage && (
                      <div className="max-h-48 overflow-hidden rounded-t-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/receipts/${receipt.id}/file`}
                          alt={receipt.fileName}
                          className="w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3">
                      {isImage ? (
                        <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{receipt.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(receipt.fileSize)} ·{' '}
                          {new Date(receipt.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(receipt.id)}
                          title="View / Download"
                        >
                          <Download className="size-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(receipt.id)}
                            disabled={deletingId === receipt.id}
                            title="Delete"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Upload section (admin only) */}
          {isAdmin && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Add receipt</p>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  variant="outline"
                  className="flex-1 justify-start truncate"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <span className="truncate">{selectedFile.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Choose file…</span>
                  )}
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="shrink-0"
                >
                  <Upload className="size-4" />
                  {isUploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WEBP, HEIC, or PDF · max 10 MB
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
