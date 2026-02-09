'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditTransactionDialog } from './edit-transaction-dialog';
import { DeleteTransactionDialog } from './delete-transaction-dialog';

interface Category {
  id: string;
  name: string;
}

interface TransactionActionsProps {
  transactionId: string;
  date: Date;
  description: string;
  amount: number;
  categoryId: string | null;
  categories: Category[];
}

export function TransactionActions({
  transactionId,
  date,
  description,
  amount,
  categoryId,
  categories,
}: TransactionActionsProps) {
  const { data: session } = useSession();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTransactionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        transactionId={transactionId}
        date={date}
        description={description}
        amount={amount}
        categoryId={categoryId}
        categories={categories}
      />

      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transaction={{ id: transactionId, description, amount }}
      />
    </>
  );
}
