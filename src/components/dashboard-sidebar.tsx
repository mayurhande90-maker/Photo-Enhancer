
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { features } from '@/lib/features';
import { Home, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-72 flex-col border-r bg-sidebar transition-transform duration-300 sm:translate-x-0 sm:flex -translate-x-full">
      <div className="flex h-16 shrink-0 items-center gap-3 px-4 border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
              <span className="text-lg">Magicpixa</span>
          </Link>
      </div>
        <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-1 p-2">
                {features.slice(0, 20).map((feature) => (
                    <Link
                    href={feature.path}
                    key={feature.name}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        pathname === feature.path
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    >
                    <feature.icon className="h-5 w-5" />
                    <span>{feature.name}</span>
                    </Link>
                ))}
            </nav>
        </ScrollArea>
        <div className="mt-auto flex flex-col items-start gap-2 p-4 border-t">
            <Link
                href="/"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
            </Link>
             <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg" disabled>
                <Settings className="h-5 w-5" />
                <span>Settings</span>
            </Button>
        </div>
    </aside>
  );
}
