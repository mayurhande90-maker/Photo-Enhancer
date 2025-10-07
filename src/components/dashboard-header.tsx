
'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { features } from '@/lib/features';
import { Button } from './ui/button';
import { Gem, User } from 'lucide-react';
import { useMonthlyQuota } from '@/hooks/use-monthly-quota';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function DashboardHeader() {
  const pathname = usePathname();
  const { credits, isLoading } = useMonthlyQuota();

  const currentFeature = features.find((f) => f.path === pathname);
  const title = currentFeature?.name || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
      <h1 className="text-xl font-semibold tracking-tight hidden sm:block">{title}</h1>
      
      <div className="flex items-center gap-4 ml-auto">
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm">
            <Gem className="mr-1 size-4 text-primary" />
            <span className="font-semibold">{credits}</span>
            <span className="text-muted-foreground">/ 10</span>
            <span className="sr-only">monthly credits remaining</span>
          </div>
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <User />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard/creations">Creations</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/pricing">Pricing</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/logout">Logout</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
