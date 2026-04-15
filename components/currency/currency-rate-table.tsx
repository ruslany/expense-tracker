'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MoreHorizontal, Trash2, Plus } from 'lucide-react';
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
import { AddCurrencyDialog } from './add-currency-dialog';
import { RemoveCurrencyDialog } from './remove-currency-dialog';
import type { ForexQuote } from '@/types';

function formatRate(rate: number | null, quoteCurrency: string): string {
  if (rate === null || rate === 0) return '—';
  return quoteCurrency === 'JPY' ? rate.toFixed(2) : rate.toFixed(4);
}

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatTime(date: Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ChangeText({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={
        value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }
    >
      {formatPercent(value)}
    </span>
  );
}

interface CurrencyRateTableProps {
  entries: ForexQuote[];
}

export function CurrencyRateTable({ entries }: CurrencyRateTableProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ForexQuote | null>(null);

  const existingSymbols = entries.map((e) => e.symbol);

  const handleRemove = (entry: ForexQuote) => {
    setSelectedItem(entry);
    setRemoveDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Exchange Rates</CardTitle>
          {isAdmin && (
            <CardAction>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus />
                Add Pair
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              No currency pairs tracked yet.{isAdmin ? ' Add a pair to get started.' : ''}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-base">
                          {entry.baseCurrency}/{entry.quoteCurrency}
                        </div>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-xs">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleRemove(entry)}
                              >
                                <Trash2 />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rate: </span>
                          {formatRate(entry.rate, entry.quoteCurrency)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Change: </span>
                          <ChangeText value={entry.changePercent} />
                        </div>
                        <div>
                          <span className="text-muted-foreground">52W High: </span>
                          {formatRate(entry.fiftyTwoWeekHigh, entry.quoteCurrency)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">52W Low: </span>
                          {formatRate(entry.fiftyTwoWeekLow, entry.quoteCurrency)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated: {formatTime(entry.lastTradeTime)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pair</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Change %</TableHead>
                      <TableHead className="text-right">52W High</TableHead>
                      <TableHead className="text-right">52W Low</TableHead>
                      <TableHead className="text-right">Last Updated</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.baseCurrency}/{entry.quoteCurrency}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRate(entry.rate, entry.quoteCurrency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChangeText value={entry.changePercent} />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRate(entry.fiftyTwoWeekHigh, entry.quoteCurrency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRate(entry.fiftyTwoWeekLow, entry.quoteCurrency)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatTime(entry.lastTradeTime)}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-xs">
                                  <MoreHorizontal className="size-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleRemove(entry)}
                                >
                                  <Trash2 />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddCurrencyDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        existingSymbols={existingSymbols}
      />

      <RemoveCurrencyDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        item={selectedItem}
      />
    </>
  );
}
