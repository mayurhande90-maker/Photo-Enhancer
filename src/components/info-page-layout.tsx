
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

function HeaderUserSection() {
    return (
        <div className="hidden items-center space-x-2 md:flex">
            <Button variant="ghost" asChild disabled>
                <span className="cursor-not-allowed">Login</span>
            </Button>
            <Button asChild disabled>
                <span className="cursor-not-allowed">Sign Up</span>
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
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/70">About</Link>
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
