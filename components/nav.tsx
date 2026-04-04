'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';
import { Badge } from '@/components/ui/badge';

interface NavProps {
  unprocessedCount?: number;
}

export function Nav({ unprocessedCount = 0 }: NavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const visibleItems = navItems.filter((item) => !item.requireAdmin || isAdmin);

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const showBadge = item.href === '/unprocessed-receipts' && unprocessedCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.title}</span>
            {showBadge && (
              <Badge variant="destructive" className="px-1.5 py-0 text-xs">
                {unprocessedCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
