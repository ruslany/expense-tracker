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
import { AddPortfolioDialog } from './add-portfolio-dialog';
import { EditPortfolioDialog } from './edit-portfolio-dialog';
import { DeletePortfolioDialog } from './delete-portfolio-dialog';
import type { PortfolioEntry } from '@/types';

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return '—';
  return `$${price.toFixed(2)}`;
}

function formatCurrencyValue(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
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

interface PortfolioTableProps {
  entries: PortfolioEntry[];
}

export function PortfolioTable({ entries }: PortfolioTableProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioEntry | null>(null);

  const totalValue = entries.reduce((sum, e) => (e.currentValue ?? 0) + sum, 0);

  const handleEdit = (entry: PortfolioEntry) => {
    setSelectedItem(entry);
    setEditDialogOpen(true);
  };

  const handleDelete = (entry: PortfolioEntry) => {
    setSelectedItem(entry);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Positions
            {totalValue > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {formatCurrencyValue(totalValue)} total
              </span>
            )}
          </CardTitle>
          <CardAction>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus />
              Add Position
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              No positions yet. Add your first holding to start tracking your portfolio.
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
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Pencil />
                              Edit Shares
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(entry)}
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
                          <span className="text-muted-foreground">Today: </span>
                          <ChangeText value={entry.changePercent} />
                        </div>
                        <div>
                          <span className="text-muted-foreground">Shares: </span>
                          {entry.quantity}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value: </span>
                          {formatCurrencyValue(entry.currentValue)}
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">% of Portfolio: </span>
                          {entry.percentOfTotal !== null
                            ? `${entry.percentOfTotal.toFixed(1)}%`
                            : '—'}
                        </div>
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
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Today</TableHead>
                      <TableHead className="text-right">Current Value</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
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
                        <TableCell className="text-right font-medium">
                          {formatPrice(entry.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChangeText value={entry.changePercent} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrencyValue(entry.currentValue)}
                        </TableCell>
                        <TableCell className="text-right">{entry.quantity}</TableCell>
                        <TableCell className="text-right">
                          {entry.percentOfTotal !== null
                            ? `${entry.percentOfTotal.toFixed(1)}%`
                            : '—'}
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
                              <DropdownMenuItem onClick={() => handleEdit(entry)}>
                                <Pencil />
                                Edit Shares
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(entry)}
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

      <AddPortfolioDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <EditPortfolioDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={selectedItem}
      />

      <DeletePortfolioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={selectedItem}
      />
    </>
  );
}
