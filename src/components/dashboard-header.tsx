
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { features } from '@/lib/features';
import { Button } from './ui/button';
import { Gem, User, LogOut } from 'lucide-react';
import { useCredit } from '@/hooks/use-credit';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const currentFeature = features.find((f) => f.path === pathname);
  const title = currentFeature?.name || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
      <h1 className="text-xl font-semibold tracking-tight hidden sm:block">{title}</h1>
      
      <div className="flex items-center gap-4 ml-auto">
        <ThemeToggle />
        <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
