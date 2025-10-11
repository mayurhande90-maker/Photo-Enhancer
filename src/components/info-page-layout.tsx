
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { User, LogOut } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

function HeaderUserSection() {
    const { user, loading: isUserLoading } = useUser();
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
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      );
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                 <Button asChild className="hidden sm:flex rounded-2xl">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                           <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/creations')}>
                            My Creations
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>My Profile</DropdownMenuItem>
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
        <div className="hidden items-center space-x-2 md:flex">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
        </div>
    );
}

export function InfoPageLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
            <span className="font-bold text-lg">Magicpixa</span>
          </Link>
           <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/#features" className="transition-colors hover:text-foreground/80 text-foreground/70">Features</Link>
            <Link href="/#pricing" className="transition-colors hover:text-foreground/80 text-foreground/70">Pricing</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <HeaderUserSection />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-12 md:py-20">
          <article className="prose prose-stone dark:prose-invert mx-auto max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">{title}</h1>
            {children}
          </article>
        </div>
      </main>
      <footer className="border-t bg-card/50">
        <div className="container py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Magicpixa. All rights reserved. | <Link href="/" className="hover:underline">Back to Home</Link></p>
        </div>
      </footer>
    </div>
  );
}
