
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

function HeaderUserSection() {
    const { user, loading: isUserLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const { credits, isLoading: isCreditLoading } = useCredit();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({
                title: 'Logged Out',
                description: "You have been successfully logged out.",
            });
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
            toast({
                title: 'Logout Failed',
                description: 'An unexpected error occurred during logout.',
                variant: 'destructive',
            });
        }
    };
    
    if (isUserLoading) {
        return <Skeleton className="h-9 w-24" />;
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <Button variant="outline">
                    <Gem className="mr-2 h-4 w-4" />
                    {isCreditLoading ? '...' : credits} Credits
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                            <User />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/creations')}>
                            My Creations
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>My Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    return (
        <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
        </nav>
    );
}

export function DashboardHeader() {
  const pathname = usePathname();

  const currentFeature = features.find((f) => f.path === pathname);
  const title = currentFeature?.name || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
      <h1 className="text-xl font-semibold tracking-tight hidden sm:block">{title}</h1>
      
      <div className="flex items-center gap-4 ml-auto">
        <ThemeToggle />
        <HeaderUserSection />
      </div>
    </header>
  );
}

    