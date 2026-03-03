import { AppShell } from './app-shell';
import { Skeleton } from './ui/skeleton';

export function PageLoading() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page title area */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>

        {/* Stat cards row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border py-6 px-6 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Main content card */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-6 py-6 border-b">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="px-6 py-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1" style={{ opacity: 1 - i * 0.08 }} />
                <Skeleton className="h-4 w-24" style={{ opacity: 1 - i * 0.08 }} />
                <Skeleton className="hidden sm:block h-4 w-20" style={{ opacity: 1 - i * 0.08 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
