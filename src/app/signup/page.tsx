
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase/provider';
import { initiateEmailSignUp } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { initializeCredits } from '@/firebase/credits';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.metadata.creationTime === user.metadata.lastSignInTime) {
        // This is a new user sign up
        try {
          // Create user profile in Firestore
          const userRef = doc(firestore, 'users', user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.email,
            photoURL: user.photoURL,
          });

          // Initialize credits for new user
          await initializeCredits(user.uid);

          toast({
            title: 'Account Created',
            description: 'You have been successfully signed up!',
          });
          router.push('/dashboard');
        } catch (error: any) {
          toast({
            title: 'Setup Failed',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    }, (error) => {
      // This is for listener errors, not signup errors
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, router, toast, displayName]);


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);

    try {
      await initiateEmailSignUp(auth, email, password);
      // The onAuthStateChanged listener will handle the rest
    } catch (error: any) {
        toast({
            title: 'Sign Up Failed',
            description: error.message,
            variant: 'destructive',
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto flex items-center justify-center space-x-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Magicpixa</span>
          </Link>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Jane Doe"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
