'use client';

import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ReceiptsDialog } from './receipts-dialog';

interface ReceiptButtonProps {
  transactionId: string;
  receiptCount: number;
}

export function ReceiptButton({ transactionId, receiptCount }: ReceiptButtonProps) {
  const [open, setOpen] = useState(false);

  const hasReceipts = receiptCount > 0;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={() => setOpen(true)}>
              <Paperclip
                className={`size-4 ${hasReceipts ? 'text-amber-500 dark:text-amber-400' : 'text-muted-foreground/50'}`}
              />
              <span className="sr-only">
                {hasReceipts ? `${receiptCount} receipt${receiptCount > 1 ? 's' : ''}` : 'Receipts'}
              </span>
            </Button>
          </TooltipTrigger>
          {hasReceipts && (
            <TooltipContent>
              {receiptCount} receipt{receiptCount > 1 ? 's' : ''}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <ReceiptsDialog open={open} onOpenChange={setOpen} transactionId={transactionId} />
    </>
  );
}
