
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { features } from '@/lib/features';
import { Button } from './ui/button';
import { User, LogOut, CreditCard, PanelLeft, Settings, ChevronRight } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useCredit } from '@/hooks/use-credit';
import { DashboardSidebar } from './dashboard-sidebar';
import Image from 'next/image';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSidebar } from './ui/sidebar';

function HeaderUserSection() {
    const { user, loading: isUserLoading } = useUser();
    const { credits, isLoading: isCreditLoading } = useCredit();
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        if (!auth) return;
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
        return (
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        );
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <Button variant="outline" className="hidden sm:flex items-center gap-2 rounded-2xl">
                  <CreditCard className="h-4 w-4" /> 
                   {isCreditLoading ? (
                        <Skeleton className="h-4 w-6" />
                    ) : (
                        <span>{credits === Infinity ? 'VIP' : credits}</span>
                    )}
                   Credits
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled className="sm:hidden">
                            <div className="flex items-center justify-between w-full">
                                <span className="flex items-center">
                                    <CreditCard className="mr-2 h-4 w-4" /> Credits
                                </span>
                                {isCreditLoading ? (
                                    <Skeleton className="h-4 w-6" />
                                ) : (
                                    <span>{credits}</span>
                                )}
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/creations')}>
                            My Creations
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>My Profile</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
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
  const { setOpenMobile } = useSidebar();
  const currentFeature = features.find((f) => f.path === pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden rounded-full" onClick={() => setOpenMobile(true)}>
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
        </Sheet>

        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                {currentFeature && (
                    <>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{currentFeature.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
      
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <ThemeToggle />
        <HeaderUserSection />
      </div>
    </header>
  );
}
