'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export function ReviewButton({ transactionId }: { transactionId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (session?.user?.role !== 'admin') return null;

  const handleReview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: true }),
      });
      if (!response.ok) throw new Error('Failed to mark as reviewed');
      router.refresh();
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleReview}
            disabled={isLoading}
            className="text-amber-500 hover:text-green-600 dark:text-amber-400 dark:hover:text-green-400"
          >
            <CheckCircle className="size-4" />
            <span className="sr-only">Mark as reviewed</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mark as reviewed</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
