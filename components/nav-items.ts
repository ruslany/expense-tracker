import {
  LayoutDashboard,
  CreditCard,
  Upload,
  PieChart,
  Settings,
  Tag,
  TrendingUp,
  LineChart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Investments',
    href: '/investments',
    icon: LineChart,
  },
  {
    title: 'Big Expenses',
    href: '/big-expenses',
    icon: PieChart,
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
  },
  {
    title: 'Administration',
    href: '/administration',
    icon: Settings,
  },
];
