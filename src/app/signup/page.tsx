
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signupAction } from '@/app/auth/actions';
import { AuthLayout } from '@/components/auth-layout';
import { Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
  displayName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormInputs>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
        setIsLoading(true);
        const result = await signupAction(data);
        
        if (result.success) {
            toast({
                title: 'Account Created!',
                description: "Welcome to Magicpixa! Please login to continue.",
            });
            router.push('/login');
        } else {
            toast({
                title: 'Signup Failed',
                description: result.error || 'An unknown error occurred.',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Join Magicpixa and start creating magic.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input id="displayName" placeholder="Priya Deshmukh" {...register('displayName')} />
                    {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="priya@example.com" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? 'text' : 'password'} 
                            {...register('password')} 
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
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
