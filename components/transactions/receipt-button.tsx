'use client';

import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReceiptsDialog } from './receipts-dialog';

interface ReceiptButtonProps {
  transactionId: string;
  receiptCount: number;
}

export function ReceiptButton({ transactionId, receiptCount }: ReceiptButtonProps) {
  const [open, setOpen] = useState(false);

  if (receiptCount === 0) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen(true)}
        title={`${receiptCount} receipt${receiptCount !== 1 ? 's' : ''}`}
      >
        <Paperclip className="size-4 text-blue-500 dark:text-blue-400" />
        <span className="sr-only">View receipts</span>
      </Button>

      <ReceiptsDialog transactionId={transactionId} open={open} onOpenChange={setOpen} />
    </>
  );
}
