
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { User, LogOut, Star, ChevronUp, Check, Settings, Moon, Sun, Monitor, Image as ImageIcon, Megaphone, Briefcase, Sparkles, Star as StarIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { features, featureCategories } from '@/lib/features';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const pricingTiers = [
  {
    name: 'Free — Discover',
    price: '₹0',
    priceSuffix: '/ month',
    features: [
      '10 credits/month',
      'Access to basic tools',
      'Watermark on exports',
      'Standard processing speed',
    ],
    cta: 'Start for Free',
    ctaPath: '/signup',
    popular: false,
  },
  {
    name: 'Pro — Create More',
    price: '₹299',
    yearlyPrice: '₹2,999',
    priceSuffix: '/ month',
    features: [
      '100 credits/month',
      'No watermark',
      'Access to premium templates',
      'Priority processing',
    ],
    cta: 'Start Free Trial',
    ctaPath: 'https://rzp.io/l/magicpixa-pro',
    popular: true,
  },
  {
    name: 'Premium+ — Live Fully',
    price: '₹499',
    yearlyPrice: '₹4,999',
    priceSuffix: '/ month',
    features: [
      'Unlimited credits',
      'Exclusive new AI tools',
      'Dedicated support',
      'Highest priority queue',
    ],
    cta: 'Start Free Trial',
    ctaPath: 'https://rzp.io/l/magicpixa-premium',
    popular: false,
  },
];

const testimonials = [
    {
      name: 'Aarav Sharma',
      city: 'Pune',
      quote: "Best AI app for creators! The background removal is flawless and saved me hours.",
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
    {
      name: 'Ritika Menon',
      city: 'Mumbai',
      quote: "My brand posters look like they were designed by a professional agency. Truly magical!",
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e'
    },
    {
      name: 'Karan Patel',
      city: 'Ahmedabad',
      quote: "So easy and addictive. I've enhanced my entire family photo collection.",
      rating: 4,
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f'
    },
    {
      name: 'Sneha Desai',
      city: 'Nashik',
      quote: "Turned my grainy, old black-and-white photo into a vibrant memory. I was speechless.",
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a'
    },
    {
      name: 'Aditya Khanna',
      city: 'Delhi',
      quote: "The YouTube thumbnail creator is a game-changer. My click-through rate has visibly improved.",
      rating: 4,
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b'
    },
    {
      name: 'Priya Singh',
      city: 'Bangalore',
      quote: "As a student, the notes generator is my secret weapon for exam prep. Highly recommended!",
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c'
    }
]

const categoryIcons = {
  [featureCategories.IMAGE_STUDIO]: ImageIcon,
  [featureCategories.CONTENT_BRAND]: Megaphone,
  [featureCategories.SMART_OFFICE]: Briefcase,
  [featureCategories.PERSONAL_MAGIC]: Sparkles,
  [featureCategories.PREMIUM]: StarIcon,
};

function HeaderUserSection() {
    const { user, loading: isUserLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
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
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      );
    }

    if (user) {
        return (
            <div className="flex items-center gap-2">
                 <Button asChild className="hidden sm:flex">
                    <Link href="/dashboard">Go to App</Link>
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
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
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
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up Free</Link>
            </Button>
        </div>
    );
}

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const handleGoProClick = (path: string) => {
    if (user) {
      window.open(path, '_blank');
    } else {
      router.push('/signup');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const categories = Object.values(featureCategories);
  const categorizedFeatures = useMemo(() => {
    return categories.map(category => ({
      name: category,
      features: features.filter(f => f.category === category)
    }));
  }, [categories]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground font-body">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-navy bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] dark:bg-[radial-gradient(theme(colors.blue.900)_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
            <span className="font-bold text-lg tracking-wide">Magicpixa</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/70">Features</Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/70">Pricing</Link>
             <Link href="#testimonials" className="transition-colors hover:text-foreground/80 text-foreground/70">Reviews</Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/70">About</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
            <HeaderUserSection />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative container grid min-h-[calc(90dvh-4rem)] items-center gap-6 pb-8 pt-10 md:py-20">
          <div className="absolute inset-0 -z-10 overflow-hidden">
             <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-primary/20 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          </div>
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text animate-shimmer bg-[length:200%_auto]">
              Your Everyday AI Studio
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
               Create. Enhance. Imagine. Transform your ideas into stunning visuals with a single click.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-2xl transition-transform hover:scale-105">
                  <Link href="/dashboard">Start Creating Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-2xl transition-transform hover:scale-105">
                  <Link href="#pricing">View Plans</Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card/50">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl font-headline">Discover the Magic — Organized Just for You</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Explore 20+ AI tools across creativity, content, productivity, and everyday life.
              </p>
            </div>
            
            <Tabs defaultValue={featureCategories.IMAGE_STUDIO} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto rounded-2xl p-2">
                {categories.map(category => {
                  const CategoryIcon = categoryIcons[category];
                  return (
                    <TabsTrigger key={category} value={category} className="flex gap-2 items-center rounded-xl py-2 data-[state=active]:shadow-md">
                      <CategoryIcon className="h-4 w-4"/>
                      {category}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              
              {categorizedFeatures.map(({name, features: categoryFeatures}) => (
                <TabsContent key={name} value={name} className="mt-8">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {categoryFeatures.map((feature) => (
                      <Link href={feature.isComingSoon || feature.isPremium ? '#' : feature.path} key={feature.name} className={cn("h-full", (feature.isComingSoon || feature.isPremium) && 'pointer-events-none')}>
                        <Card className="h-full flex flex-col rounded-3xl transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg hover:shadow-brand-accent/20 group relative overflow-hidden">
                           {(feature.isComingSoon || feature.isPremium) && (
                            <Badge variant={feature.isPremium ? "default" : "secondary"} className={cn("absolute top-4 right-4 z-10", feature.isPremium && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white")}>
                              {feature.isPremium ? 'Premium' : 'Coming Soon'}
                            </Badge>
                          )}
                          <CardHeader className="items-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 text-brand-primary group-hover:from-brand-primary/30 group-hover:to-brand-secondary/30">
                              <feature.icon className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-base font-semibold">{feature.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-center text-xs text-muted-foreground flex-1">
                            {feature.description}
                          </CardContent>
                          <CardFooter className="mt-auto flex justify-center pb-4">
                            <span className={cn("text-sm font-medium text-brand-accent group-hover:underline", (feature.isComingSoon || feature.isPremium) && 'opacity-50')}>Try Now →</span>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl font-headline">Loved by Creators Across India 🇮🇳</h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Real stories from creators who transformed their workflow with Magicpixa.
                </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                  <Card key={testimonial.name} className="flex flex-col justify-between rounded-3xl p-6 transition-transform hover:-translate-y-1">
                      <CardContent className="p-0">
                          <div className="flex items-center mb-4">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("w-5 h-5", i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />
                              ))}
                          </div>
                          <blockquote className="text-base">"{testimonial.quote}"</blockquote>
                      </CardContent>
                      <CardHeader className="flex-row items-center gap-4 p-0 pt-6">
                          <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className="rounded-full" />
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.city}</p>
                          </div>
                      </CardHeader>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-card/50">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl font-headline">Choose Your Plan</h2>
               <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Start free, upgrade anytime. Simple plans for every creator.
              </p>
            </div>
             <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  'flex flex-col rounded-3xl border-2 transition-all duration-300',
                  tier.popular ? 'border-brand-accent shadow-2xl shadow-brand-accent/20 scale-105' : 'border-border'
                )}>
                  <CardHeader className="p-6">
                    <CardTitle className="flex justify-between items-center font-headline">
                      {tier.name}
                      {tier.popular && <div className="text-xs font-medium text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full">POPULAR</div>}
                    </CardTitle>
                     <CardDescription className="pt-2">
                      <span className="text-4xl font-bold text-foreground">{billingCycle === 'monthly' ? tier.price : tier.yearlyPrice}</span>
                      <span className="text-muted-foreground">{billingCycle === 'monthly' ? '/ month' : '/ year'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 p-6 pt-0">
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleGoProClick(tier.ctaPath)}
                      className={cn(
                        "w-full rounded-2xl text-base py-6 transition-all",
                        tier.popular && "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg hover:shadow-brand-primary/50"
                      )}
                      variant={tier.popular ? "default" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">Cancel anytime. No hidden fees. 7-day free trial on Pro plans.</p>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24 lg:py-32">
            <div className="container">
                <div className="rounded-3xl bg-gradient-to-r from-brand-primary to-brand-secondary p-8 md:p-12 text-center text-primary-foreground">
                     <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl font-headline">Bring Your Imagination to Life</h2>
                     <p className="max-w-2xl mx-auto mt-4 text-lg text-primary-foreground/80">
                        Join 10,000+ creators enhancing their world with AI. Start your journey today.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="mt-8 rounded-2xl text-lg px-8 py-6 transition-transform hover:scale-105">
                        <Link href="/dashboard">Start Creating Now (Free)</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="border-t bg-card/50">
        <div className="container py-12 px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-4">
                 <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
                        <span className="font-bold text-lg">Magicpixa</span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">Your Everyday AI Studio — Create. Enhance. Imagine.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <Link href="#features" className="hover:text-foreground">Features</Link>
                        <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
                        <Link href="/about" className="hover:text-foreground">About Us</Link>
                        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                    </nav>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Legal</h4>
                    <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <Link href="/terms" className="hover:text-foreground">Terms & Conditions</Link>
                        <Link href="/policy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/cancellation-refunds" className="hover:text-foreground">Cancellation & Refund Policy</Link>
                    </nav>
                </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Magicpixa. All Rights Reserved.
            </div>
        </div>
      </footer>

      <Button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6 rounded-full p-2 h-12 w-12 transition-opacity duration-300 z-50",
          "bg-gradient-to-tr from-brand-primary to-brand-secondary text-white",
          showScrollToTop ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        size="icon"
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </div>
  );
}
