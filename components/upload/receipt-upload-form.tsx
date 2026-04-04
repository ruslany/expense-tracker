'use client';

import { useState, useRef } from 'react';
import { Camera, CheckCircle2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type State = 'idle' | 'selected' | 'uploading' | 'success';

export function ReceiptUploadForm() {
  const [state, setState] = useState<State>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setState('selected');

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function handleClear() {
    setSelectedFile(null);
    setPreview(null);
    setState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setState('uploading');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/receipts/unprocessed', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedName(selectedFile.name);
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setState('success');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setState('selected');
    }
  }

  function handleUploadAnother() {
    setState('idle');
    setUploadedName('');
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <CheckCircle2 className="size-16 text-green-500" />
        <div>
          <p className="text-xl font-semibold">Receipt uploaded!</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {uploadedName} has been added to the queue and will be matched to a transaction.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={handleUploadAnother}>
          Upload another receipt
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* File input — hidden, triggered by button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview / picker area */}
      {state === 'idle' ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 transition-colors active:bg-muted"
        >
          <Camera className="size-12 text-muted-foreground" />
          <span className="text-base font-medium text-muted-foreground">
            Tap to take photo or choose file
          </span>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border bg-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Receipt preview" className="max-h-72 w-full object-contain" />
          ) : (
            <div className="flex h-36 items-center justify-center">
              <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur-sm"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <Button
        size="lg"
        className="w-full text-base"
        disabled={state !== 'selected'}
        onClick={handleUpload}
      >
        {state === 'uploading' ? (
          <>
            <Upload className="mr-2 size-5 animate-pulse" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="mr-2 size-5" />
            Upload Receipt
          </>
        )}
      </Button>

      {state === 'idle' && (
        <p className="text-center text-xs text-muted-foreground">
          JPEG, PNG, HEIC, or PDF · max 10 MB
        </p>
      )}
    </div>
  );
}
