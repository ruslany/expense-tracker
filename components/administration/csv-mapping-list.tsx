'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CSVMappingDialog } from './csv-mapping-dialog';

interface CSVMapping {
  id: string;
  institution: string;
  skipPatterns: string[];
}

interface CSVMappingListProps {
  mappings: CSVMapping[];
}

export function CSVMappingList({ mappings }: CSVMappingListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<CSVMapping | null>(null);

  const handleEdit = (mapping: CSVMapping) => {
    setSelectedMapping(mapping);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Import Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {mappings.length === 0 ? (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
              No import rules found.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {mappings.map((mapping) => (
                  <Card key={mapping.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{mapping.institution}</div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(mapping)}
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </div>
                      {mapping.skipPatterns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mapping.skipPatterns.map((pattern, index) => (
                            <Badge key={index} variant="secondary">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skip patterns</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Skip Patterns</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-medium">{mapping.institution}</TableCell>
                        <TableCell>
                          {mapping.skipPatterns.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {mapping.skipPatterns.map((pattern, index) => (
                                <Badge key={index} variant="secondary">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No skip patterns</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleEdit(mapping)}
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
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

      <CSVMappingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mapping={selectedMapping}
      />
    </>
  );
}
