import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';
import { fetchUnprocessedReceipts } from '@/lib/data';
import { UnprocessedReceiptsList } from '@/components/unprocessed-receipts/unprocessed-receipts-list';

export const metadata: Metadata = { title: 'Unprocessed Receipts' };
export const dynamic = 'force-dynamic';

export default async function UnprocessedReceiptsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const receipts = await fetchUnprocessedReceipts();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Unprocessed Receipts</h1>
          <p className="text-muted-foreground">
            {receipts.length === 0
              ? 'All receipts have been matched.'
              : `${receipts.length} receipt${receipts.length !== 1 ? 's' : ''} waiting to be matched to a transaction.`}
          </p>
        </div>
        <UnprocessedReceiptsList receipts={receipts} />
      </div>
    </AppShell>
  );
}
