'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccountDialog } from './account-dialog';
import { DeleteAccountDialog } from './delete-account-dialog';

interface Account {
  id: string;
  name: string;
  institution: string;
  accountType: string;
  transactionCount: number;
}

interface AccountListProps {
  accounts: Account[];
}

const INSTITUTION_LABELS: Record<string, string> = {
  fidelity: 'Fidelity',
  citi: 'Citi',
  amex: 'American Express',
  firsttech: "First Tech CU"
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  checking: 'Checking',
  savings: 'Savings',
};

export function AccountList({ accounts }: AccountListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  const handleDelete = (account: Account) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAccount(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardAction>
            <Button onClick={handleAddNew}>
              <Plus />
              Add Account
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              No accounts found. Create your first account to get started.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {accounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{account.name}</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(account)}>
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(account)}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {INSTITUTION_LABELS[account.institution] || account.institution} &bull;{' '}
                        {ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {account.transactionCount} transaction(s)
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>
                          {INSTITUTION_LABELS[account.institution] || account.institution}
                        </TableCell>
                        <TableCell>
                          {ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType}
                        </TableCell>
                        <TableCell className="text-right">{account.transactionCount}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-xs">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(account)}>
                                <Pencil />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(account)}
                              >
                                <Trash2 />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AccountDialog open={dialogOpen} onOpenChange={setDialogOpen} account={selectedAccount} />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        account={selectedAccount}
      />
    </>
  );
}
