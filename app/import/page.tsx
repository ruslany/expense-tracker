"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CSVUploader } from "@/components/csv-uploader";
import { ImportHistory } from "@/components/import-history";

// Mock import history data
const mockHistory = [
  {
    id: "1",
    fileName: "fidelity_2024_jan.csv",
    institution: "fidelity",
    rowsImported: 45,
    importedAt: new Date("2024-01-20T10:30:00"),
  },
  {
    id: "2",
    fileName: "citi_december_2023.csv",
    institution: "citi",
    rowsImported: 52,
    importedAt: new Date("2024-01-15T14:20:00"),
  },
  {
    id: "3",
    fileName: "amex_nov_2023.csv",
    institution: "amex",
    rowsImported: 38,
    importedAt: new Date("2024-01-10T09:15:00"),
  },
];

export default function ImportPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Transactions</h1>
          <p className="text-muted-foreground">
            Upload CSV files from your credit card institutions
          </p>
        </div>

        {/* CSV Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <CSVUploader />
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportHistory history={mockHistory} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
