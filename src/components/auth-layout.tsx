
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

export function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-navy bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] dark:bg-[radial-gradient(theme(colors.blue.900)_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
            <span className="font-bold text-lg">Magicpixa</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
      <footer className="border-t">
        <div className="container py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Magicpixa. All rights reserved. | <Link href="/" className="hover:underline">Back to Home</Link></p>
        </div>
      </footer>
    </div>
  );
}
