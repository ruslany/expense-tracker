import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

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
              {formatDate(item.importedAt)} at{" "}
              {item.importedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
