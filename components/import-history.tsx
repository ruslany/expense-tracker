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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-medium">File Name</th>
            <th className="px-4 py-3 text-left font-medium">Institution</th>
            <th className="px-4 py-3 text-left font-medium">Rows Imported</th>
            <th className="px-4 py-3 text-left font-medium">Imported At</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="px-4 py-3">{item.fileName}</td>
              <td className="px-4 py-3 capitalize">{item.institution}</td>
              <td className="px-4 py-3">{item.rowsImported}</td>
              <td className="px-4 py-3">
                {formatDate(item.importedAt)} at{" "}
                {item.importedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
