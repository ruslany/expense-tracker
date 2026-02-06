import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { AccountList } from '@/components/accounts/account-list';
import { fetchAccountsWithTransactionCount } from '@/lib/data';

export const metadata: Metadata = { title: 'Accounts' };
export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const accounts = await fetchAccountsWithTransactionCount();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your credit card and bank accounts</p>
        </div>

        <AccountList accounts={accounts} />
      </div>
    </AppShell>
  );
}
