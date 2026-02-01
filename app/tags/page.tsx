import { AppShell } from '@/components/app-shell';
import { TagList } from '@/components/tags/tag-list';
import { fetchTagsWithTransactionCount } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
  const tags = await fetchTagsWithTransactionCount();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">Manage tags for organizing and filtering transactions</p>
        </div>

        <TagList tags={tags} />
      </div>
    </AppShell>
  );
}
