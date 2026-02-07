'use client';

import { useState } from 'react';
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
import { AddWatchlistDialog } from './add-watchlist-dialog';
import { RemoveWatchlistDialog } from './remove-watchlist-dialog';
import type { WatchlistEntry } from '@/types';

const FUND_TYPE_LABELS: Record<string, string> = {
  etf: 'ETF',
  mutual_fund: 'Fund',
  stock: 'Stock',
};

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return '—';
  return `$${price.toFixed(2)}`;
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
    <span className={value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
      {formatPercent(value)}
    </span>
  );
}

interface WatchlistTableProps {
  entries: WatchlistEntry[];
}

export function WatchlistTable({ entries }: WatchlistTableProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WatchlistEntry | null>(null);

  const handleRemove = (entry: WatchlistEntry) => {
    setSelectedItem(entry);
    setRemoveDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardAction>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus />
              Add Fund
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              Your watchlist is empty. Add ETFs, mutual funds, or stocks to track their performance.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{entry.symbol}</div>
                          <div className="text-xs text-muted-foreground">{entry.name}</div>
                        </div>
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
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price: </span>
                          {formatPrice(entry.price)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Change: </span>
                          <ChangeText value={entry.changePercent} />
                        </div>
                        <div>
                          <span className="text-muted-foreground">YTD: </span>
                          <ChangeText value={entry.ytdReturn} />
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type: </span>
                          {FUND_TYPE_LABELS[entry.fundType] || entry.fundType}
                        </div>
                        <div>
                          <span className="text-muted-foreground">52W High: </span>
                          {formatPrice(entry.fiftyTwoWeekHigh)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">52W Low: </span>
                          {formatPrice(entry.fiftyTwoWeekLow)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last trade: {formatTime(entry.lastTradeTime)}
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
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Change %</TableHead>
                      <TableHead className="text-right">YTD Return</TableHead>
                      <TableHead className="text-right">52W High</TableHead>
                      <TableHead className="text-right">52W Low</TableHead>
                      <TableHead className="text-right">Last Trade</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="font-medium">{entry.symbol}</div>
                          <div className="text-xs text-muted-foreground">{entry.name}</div>
                        </TableCell>
                        <TableCell>
                          {FUND_TYPE_LABELS[entry.fundType] || entry.fundType}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(entry.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChangeText value={entry.changePercent} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ChangeText value={entry.ytdReturn} />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(entry.fiftyTwoWeekHigh)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(entry.fiftyTwoWeekLow)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatTime(entry.lastTradeTime)}
                        </TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddWatchlistDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <RemoveWatchlistDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        item={selectedItem}
      />
    </>
  );
}
