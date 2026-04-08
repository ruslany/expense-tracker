'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.82;

async function compressImage(file: File): Promise<File> {
  if (file.type === 'application/pdf') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
          } else {
            resolve(
              new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }),
            );
          }
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

async function uploadFile(file: File): Promise<void> {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append('file', compressed);

  const res = await fetch('/api/receipts/unprocessed', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Upload failed');
  }
}

export function ReceiptDropzone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(
        (f) => f.type.startsWith('image/') || f.type === 'application/pdf',
      );
      if (list.length === 0) {
        toast.error('Only images and PDFs are supported');
        return;
      }

      setUploading(true);
      const results = await Promise.allSettled(list.map(uploadFile));
      setUploading(false);

      const failed = results.filter((r) => r.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (succeeded > 0) {
        toast.success(succeeded === 1 ? 'Receipt uploaded' : `${succeeded} receipts uploaded`);
        router.refresh();
      }
      if (failed > 0) {
        toast.error(`${failed} file${failed !== 1 ? 's' : ''} failed to upload`);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [router],
  );

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex items-center gap-4 rounded-lg border-2 border-dashed px-4 py-3 transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={onInputChange}
      />
      <Upload className="size-5 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-sm text-muted-foreground">
        {isDragging ? 'Drop files here' : 'Drag & drop receipts here, or'}
      </p>
      <Button
        size="sm"
        variant="outline"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : 'Browse files'}
      </Button>
    </div>
  );
}
