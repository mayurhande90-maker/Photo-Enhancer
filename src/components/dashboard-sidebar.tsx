
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { features } from '@/lib/features';
import { Home, Settings, Image } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function DashboardSidebar() {
  const pathname = usePathname();

  const aiTools = features.filter(f => f.name !== 'My Creations');

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 sm:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
              <span className="text-lg">Magicpixa</span>
          </Link>
      </div>
        <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-1 p-2">
                <Link
                    href="/dashboard"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        pathname === '/dashboard'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                </Link>
                <Link
                    href="/dashboard/creations"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        pathname === '/dashboard/creations'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Image className="h-5 w-5" />
                    <span>My Creations</span>
                </Link>
                 <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:no-underline">
                             AI Tools
                        </AccordionTrigger>
                        <AccordionContent className="pl-4">
                            {aiTools.map((feature) => (
                                <Link
                                href={feature.path}
                                key={feature.name}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm',
                                    pathname === feature.path
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                                >
                                <feature.icon className="h-4 w-4" />
                                <span>{feature.name}</span>
                                </Link>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
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
