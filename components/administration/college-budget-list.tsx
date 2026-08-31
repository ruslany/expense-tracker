'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
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
import { formatCurrency } from '@/lib/utils';
import { CollegeBudgetDialog } from './college-budget-dialog';
import { DeleteCollegeBudgetDialog } from './delete-college-budget-dialog';

interface Tag {
  id: string;
  name: string;
}

export interface CollegeBudget {
  id: string;
  label: string;
  academicYearStart: Date;
  academicYearEnd: Date;
  tagId: string;
  limitAmount: number;
  notes: string | null;
  tag: Tag;
}

interface CollegeBudgetListProps {
  collegeBudgets: CollegeBudget[];
  tags: Tag[];
}

function formatAcademicYear(start: Date, end: Date) {
  return `${formatInTimeZone(start, 'UTC', 'MMM yyyy')} – ${formatInTimeZone(end, 'UTC', 'MMM yyyy')}`;
}

export function CollegeBudgetList({ collegeBudgets, tags }: CollegeBudgetListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<CollegeBudget | null>(null);

  const handleEdit = (budget: CollegeBudget) => {
    setSelectedBudget(budget);
    setDialogOpen(true);
  };

  const handleDelete = (budget: CollegeBudget) => {
    setSelectedBudget(budget);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedBudget(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>College Budgets</CardTitle>
          <CardAction>
            <Button onClick={handleAddNew}>
              <Plus />
              Add Budget
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {collegeBudgets.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              No college budgets found. Create one to track spend against a school&apos;s cost of
              attendance.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {collegeBudgets.map((budget) => (
                  <Card key={budget.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{budget.label}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(budget)}>
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(budget)}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatAcademicYear(budget.academicYearStart, budget.academicYearEnd)} ·{' '}
                        {budget.tag.name}
                      </p>
                      <p className="text-sm">{formatCurrency(budget.limitAmount)} limit</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead className="text-right">Limit</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collegeBudgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.label}</TableCell>
                        <TableCell>
                          {formatAcademicYear(budget.academicYearStart, budget.academicYearEnd)}
                        </TableCell>
                        <TableCell>{budget.tag.name}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(budget.limitAmount)}
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
                              <DropdownMenuItem onClick={() => handleEdit(budget)}>
                                <Pencil />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(budget)}
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

      <CollegeBudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={selectedBudget}
        tags={tags}
      />

      <DeleteCollegeBudgetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        budget={selectedBudget}
      />
    </>
  );
}
