
'use client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
    return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Signup Disabled</CardTitle>
          <CardDescription>
            User accounts are currently not required. You can access all features directly.
            <br />
            <Link href="/dashboard" className="underline mt-4 inline-block">Go to Dashboard</Link>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
    )
}
