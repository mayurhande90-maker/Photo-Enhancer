
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { features } from '@/lib/features';
import { Button } from './ui/button';
import { Gem } from 'lucide-react';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, error } = useUser();
  const currentFeature = features.find((f) => f.path === pathname);
  const title = currentFeature?.name || 'Dashboard';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {loading ? (
            <Skeleton className="h-9 w-20" />
        ): user ? (
             <Button variant="outline" size="sm">
                <Gem className="mr-2 size-4" />
                <span className="font-semibold">{user.credits ?? 0}</span>
                <span className="sr-only">credits remaining</span>
            </Button>
        ) : null}
      </div>
    </header>
  );
}

    