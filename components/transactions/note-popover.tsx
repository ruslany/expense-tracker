'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface TransactionNotePopoverProps {
  transactionId: string;
  notes: string | null;
}

export function TransactionNotePopover({
  transactionId,
  notes,
}: TransactionNotePopoverProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(notes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  if (session?.user?.role !== 'admin') {
    if (!notes) return null;
    return (
      <TooltipProvider>
        <Tooltip>
          <Popover>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <StickyNote className="size-4 text-amber-500 dark:text-amber-400" />
                  <span className="sr-only">View note</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              <p className="whitespace-pre-wrap">{notes}</p>
            </TooltipContent>
            <PopoverContent align="end" className="w-64">
              <p className="text-sm whitespace-pre-wrap">{notes}</p>
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const hasNote = !!notes;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value.trim() || null }),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerButton = (
    <Button variant="ghost" size="icon-xs">
      <StickyNote
        className={`size-4 ${hasNote ? 'text-amber-500 dark:text-amber-400' : 'text-muted-foreground/50'}`}
      />
      <span className="sr-only">{hasNote ? 'Edit note' : 'Add note'}</span>
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip open={hasNote && !open ? undefined : false}>
        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (isOpen) {
              setValue(notes ?? '');
            }
          }}
        >
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            <p className="whitespace-pre-wrap">{notes}</p>
          </TooltipContent>
          <PopoverContent align="end" className="w-64 space-y-2">
            <Textarea
              placeholder="Add a note..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-20 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
}
