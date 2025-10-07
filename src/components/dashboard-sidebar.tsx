
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { features } from '@/lib/features';
import { Home, Settings } from 'lucide-react';
import { Button } from './ui/button';

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col gap-4 px-4 sm:py-5">
            <Link
              href="/"
              className="group flex h-9 shrink-0 items-center gap-2 rounded-full bg-primary px-3 text-lg font-semibold text-primary-foreground md:h-8 md:text-base"
            >
              <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="">Magicpixa</span>
            </Link>
            {features.map((feature) => (
                <Link
                  href={feature.path}
                  key={feature.name}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    pathname === feature.path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <feature.icon className="h-5 w-5" />
                  <span>{feature.name}</span>
                </Link>
            ))}
        </nav>
        <nav className="mt-auto flex flex-col items-start gap-4 px-4 sm:py-5">
            <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
            </Link>
        </nav>
    </aside>
  );
}
