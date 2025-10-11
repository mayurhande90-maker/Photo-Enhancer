
'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth-layout';
import { Eye, EyeOff, Loader2, Terminal } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Join Magicpixa and start creating magic.
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => e.preventDefault()}>
            <CardContent className="grid gap-4">
                 <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Feature Disabled</AlertTitle>
                  <AlertDescription>
                    User registration is currently disabled.
                  </AlertDescription>
                </Alert>
                <div className="grid gap-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input id="displayName" placeholder="Aarav Sharma" disabled />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="aarav@example.com" disabled />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? 'text' : 'password'}
                            disabled
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sign Up
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="underline font-semibold hover:text-primary">
                        Login
                    </Link>
                </div>
            </CardFooter>
        </form>
      </Card>
    </AuthLayout>
    )
}
