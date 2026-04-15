import {
  CalendarDays,
  CreditCard,
  Upload,
  PieChart,
  Settings,
  Tag,
  TrendingUp,
  LineChart,
  LayoutGrid,
  Receipt,
  ArrowLeftRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  requireAdmin?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/',
    icon: CalendarDays,
  },
  {
    title: 'Investments',
    href: '/investments',
    icon: LineChart,
  },
  {
    title: 'Currency',
    href: '/currency',
    icon: ArrowLeftRight,
  },
  {
    title: 'Big Expenses',
    href: '/big-expenses',
    icon: PieChart,
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: LayoutGrid,
  },
  {
    title: 'Tags',
    href: '/tags',
    icon: Tag,
  },
  {
    title: 'Trends',
    href: '/trends',
    icon: TrendingUp,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    title: 'Import',
    href: '/import',
    icon: Upload,
    requireAdmin: true,
  },
  {
    title: 'Receipts',
    href: '/receipts',
    icon: Receipt,
    requireAdmin: true,
  },
  {
    title: 'Administration',
    href: '/administration',
    icon: Settings,
    requireAdmin: true,
  },
];
