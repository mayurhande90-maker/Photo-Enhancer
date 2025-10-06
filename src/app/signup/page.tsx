
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/icons';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto flex items-center space-x-2 mb-4">
            <Logo className="h-8 w-8" />
          </Link>
          <CardTitle className="text-2xl">Signup Disabled</CardTitle>
          <CardDescription>
            Authentication is temporarily disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            You can access the dashboard directly.
          </p>
          <Link href="/dashboard">
            <button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                Go to Dashboard
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
