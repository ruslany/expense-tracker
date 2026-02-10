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
import { Badge } from '@/components/ui/badge';
import { CategoryDialog } from './category-dialog';
import { DeleteCategoryDialog } from './delete-category-dialog';

interface Category {
  id: string;
  name: string;
  keywords: string[];
  transactionCount: number;
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Collect all keywords from all categories for validation
  const allKeywords = categories.flatMap((c) => c.keywords);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardAction>
            <Button onClick={handleAddNew}>
              <Plus />
              Add Category
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              No categories found. Create your first category to get started.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{category.name}</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(category)}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {category.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {category.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No keywords</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {category.transactionCount} transaction(s)
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
                      <TableHead>Keywords</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          {category.keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {category.keywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No keywords</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{category.transactionCount}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-xs">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(category)}>
                                <Pencil />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(category)}
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

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        existingKeywords={allKeywords}
      />

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={selectedCategory}
      />
    </>
  );
}
