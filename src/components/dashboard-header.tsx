
'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { features } from '@/lib/features';
import { Button } from './ui/button';
import { Gem } from 'lucide-react';
import { useDailyQuota } from '@/hooks/use-daily-quota';
import { Skeleton } from './ui/skeleton';

export function DashboardHeader() {
  const pathname = usePathname();
  const { credits, isLoading } = useDailyQuota();

  const currentFeature = features.find((f) => f.path === pathname);
  const title = currentFeature?.name || 'Dashboard';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <Button variant="outline" size="sm">
            <Gem className="mr-2 size-4" />
            <span className="font-semibold">{credits}</span>
            <span className="sr-only">daily credits remaining</span>
          </Button>
        )}
      </div>
    </header>
  );
}
