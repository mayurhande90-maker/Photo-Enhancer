
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function InfoPageLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Magicpixa</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <nav className="hidden items-center space-x-2 md:flex">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </nav>
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
      <footer className="border-t">
        <div className="container py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Magicpixa. All rights reserved. | <Link href="/" className="hover:underline">Back to Home</Link></p>
        </div>
      </footer>
    </div>
  );
}
