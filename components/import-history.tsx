import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface ImportHistoryItem {
  id: string;
  fileName: string;
  institution: string;
  rowsImported: number;
  importedAt: Date;
}

interface ImportHistoryProps {
  history: ImportHistoryItem[];
}

export function ImportHistory({ history }: ImportHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No import history yet. Upload your first CSV file to get started.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {history.map((item) => (
          <div key={item.id} className="rounded-lg border p-3 space-y-2">
            <div className="font-medium truncate" title={item.fileName}>
              {item.fileName}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize text-muted-foreground">{item.institution}</span>
              <span>{item.rowsImported} rows</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(item.importedAt)} at{' '}
              {item.importedAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Rows Imported</TableHead>
              <TableHead>Imported At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.fileName}</TableCell>
                <TableCell className="capitalize">{item.institution}</TableCell>
                <TableCell>{item.rowsImported}</TableCell>
                <TableCell>
                  {formatDate(item.importedAt)} at{' '}
                  {item.importedAt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
