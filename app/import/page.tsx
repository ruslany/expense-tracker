import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CSVUploader } from '@/components/import/csv-uploader';
import { ImportHistory } from '@/components/import/import-history';
import { getPrisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Import' };
export const dynamic = 'force-dynamic';

async function getImportHistory() {
  const prisma = await getPrisma();
  const history = await prisma.importHistory.findMany({
    orderBy: { importedAt: 'desc' },
    take: 10,
  });
  return history;
}

export default async function ImportPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const history = await getImportHistory();
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
            <ImportHistory history={history} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
