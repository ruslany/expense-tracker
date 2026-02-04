import { AppShell } from '@/components/app-shell';
import { AdministrationTabs } from '@/components/administration/administration-tabs';
import {
  fetchAccountsWithTransactionCount,
  fetchCategoriesWithKeywords,
  fetchTagsWithTransactionCount,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdministrationPage() {
  const [accounts, categories, tags] = await Promise.all([
    fetchAccountsWithTransactionCount(),
    fetchCategoriesWithKeywords(),
    fetchTagsWithTransactionCount(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">
            Manage accounts, categories, and tags
          </p>
        </div>

        <AdministrationTabs
          accounts={accounts}
          categories={categories}
          tags={tags}
        />
      </div>
    </AppShell>
  );
}
