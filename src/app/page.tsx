
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Wand2, Scissors, Camera, Palette, Star, ChevronUp, Gem, User, LogOut } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { BeforeAfterSlider } from '@/components/before-after-slider';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useCredit } from '@/hooks/use-credit';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const features = [
  {
    name: 'Photo Enhancement',
    description: 'Fix lighting, colors, noise, and resolution automatically.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-enhance-before')!,
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-enhance-after')!,
    path: '/dashboard/enhance',
  },
  {
    name: 'Background Removal',
    description: 'Instantly remove backgrounds to get clean, transparent PNGs.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-background-before')!,
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-background-after')!,
    path: '/dashboard/background-removal',
  },
  {
    name: 'Photo Studio',
    description: 'Create e-commerce ready product shots with perfect lighting.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-studio-before')!,
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-studio-after')!,
    path: '/dashboard/studio',
  },
  {
    name: 'Photo Colorize',
    description: 'Bring old black and white photos to life with natural colors.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-colorize-before')!,
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-colorize-after')!,
    path: '/dashboard/colorize',
  },
];

const featureCards = [
    {
      icon: <Wand2 className="size-8 text-primary" />,
      title: 'Photo Enhancement',
      description: 'Fix dull lighting and flat colors—make your photos pop instantly.',
      path: '/dashboard/enhance',
    },
    {
      icon: <Scissors className="size-8 text-primary" />,
      title: 'Background Vanisher',
      description: 'Remove distractions. Keep only what matters.',
      path: '/dashboard/background-removal',
    },
    {
      icon: <Camera className="size-8 text-primary" />,
      title: 'AI Photo Studio',
      description: 'Drop your raw product pic, and watch AI build a marketing-ready image.',
      path: '/dashboard/studio',
    },
    {
      icon: <Palette className="size-8 text-primary" />,
      title: 'Retro to Real',
      description: 'Bring old black-and-white memories to life with one tap.',
      path: '/dashboard/colorize',
    },
];

const pricingTiers = [
  {
    name: 'Free',
    price: '₹0',
    priceSuffix: '/ month',
    features: [
      '10 image enhancements per month',
      'Access to all features',
      'Standard processing speed',
    ],
    cta: 'Start for Free',
    ctaPath: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    priceSuffix: '/ month',
    features: [
      '200 image enhancements per month',
      'All features unlocked',
      'Priority processing',
    ],
    cta: 'Go Pro',
    ctaPath: 'https://rzp.io/rzp/r90n01c',
    popular: true,
  },
];

const testimonials = [
    {
      name: 'Aarav Mehta',
      title: 'E-commerce Seller',
      quote: "Magicpixa made my product photos look like they were shot in a high-end studio!",
      rating: 5,
    },
    {
      name: 'Priya Deshmukh',
      title: 'Genealogy Enthusiast',
      quote: "I revived my old family album in color. So easy, it’s addictive!",
      rating: 4,
    },
    {
      name: 'Rohan Nair',
      title: 'Photographer',
      quote: "Background removal is crazy fast. The ‘Enhance’ button literally saves my photos.",
      rating: 5,
    },
    {
      name: 'Sneha Patil',
      title: 'Social Media Manager',
      quote: "Simple, smart, and surprisingly magical. Definitely my go-to AI editor.",
      rating: 4,
    },
]

export default function Home() {
  const { user, loading: isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const { credits, isLoading: isCreditLoading } = useCredit();
  const router = useRouter();
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [currentFeatureName, setCurrentFeatureName] = React.useState(features[0].name);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
    setCurrentFeatureName(features[api.selectedScrollSnap()].name);
 
    const handleSelect = () => {
        setCurrent(api.selectedScrollSnap());
        setCurrentFeatureName(features[api.selectedScrollSnap()].name);
    }

    api.on("select", handleSelect)
 
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

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

  const handleGoProClick = () => {
    if (user) {
      // User is logged in, redirect to the payment link.
      const proTier = pricingTiers.find(p => p.name === 'Pro');
      if (proTier) {
        window.location.href = proTier.ctaPath;
      }
    } else {
      // User is not logged in, redirect to signup.
      router.push('/signup');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging you out.',
        variant: 'destructive'
      })
    }
  }

  const isLoading = isUserLoading || isCreditLoading;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#29abe255_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Magicpixa</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">Home</Link>
            <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm">
                  <Gem className="mr-1 size-4 text-primary" />
                  <span className="font-semibold">{credits}</span>
                  <span className="text-muted-foreground">credits</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      className="overflow-hidden rounded-full"
                    >
                      <User />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/creations">Creations</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <nav className="hidden items-center space-x-2 md:flex">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </nav>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid min-h-[calc(100dvh-3.5rem)] items-center gap-6 pb-8 pt-10 md:py-20">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col items-start gap-4">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                Transform Any Photo Into Pure Magic ✨
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                 Enhance, stylize, remove backgrounds, and colorize — all powered by AI.
              </p>
              <div className="flex flex-wrap items-start gap-4">
                  <Button asChild size="lg">
                    <Link href="/dashboard">Create Magic</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="#features">Explore Features</Link>
                  </Button>
              </div>
            </div>
            <div className="relative w-full h-[450px] rounded-lg overflow-hidden border shadow-lg group">
                <Carousel 
                    setApi={setApi}
                    className="w-full h-full"
                    plugins={[
                      Autoplay({
                        delay: 4000,
                        stopOnInteraction: true,
                      }),
                    ]}
                >
                    <CarouselContent>
                        {features.map((feature, index) => (
                            <CarouselItem key={index}>
                                <BeforeAfterSlider
                                    before={feature.imageBefore.imageUrl}
                                    after={feature.imageAfter.imageUrl}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                 <Badge variant="secondary" className="absolute top-4 left-4 text-lg transition-all duration-300 ease-in-out">
                    {currentFeatureName}
                </Badge>
            </div>
          </div>
           <div className="absolute bottom-10 right-10 flex items-center justify-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 animate-bounce">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Scroll
            </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">What You Can Do with Magicpixa</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Four tools. Endless creative power.
              </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-4">
              {featureCards.map((feature) => (
                <Link href={feature.path} key={feature.title} className="h-full">
                  <Card className="h-full flex flex-col transform-gpu transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                        <Button variant="link" className="p-0 mt-auto justify-start">
                            {feature.title === 'Background Vanisher' && 'Erase & Shine'}
                            {feature.title === 'Photo Enhancement' && 'Enhance Now'}
                            {feature.title === 'AI Photo Studio' && 'Launch Studio'}
                            {feature.title === 'Retro to Real' && 'Colorize It'}
                             →
                        </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
             <div className="text-center">
                <p className="text-muted-foreground">All AI features are powered by our custom Magic Engine — built to deliver speed, detail, and zero lag.</p>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Loved by Creators Everywhere</h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Real users. Real results.
                </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((testimonial) => (
                  <Card key={testimonial.name} className="flex flex-col justify-between">
                      <CardHeader>
                          <div className="flex items-center mb-2">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              ))}
                          </div>
                          <CardDescription className="text-base text-foreground">"{testimonial.quote}"</CardDescription>
                      </CardHeader>
                      <div className="p-6 pt-0">
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                      </div>
                  </Card>
              ))}
            </div>
          </div>
        </section>
        <section id="pricing" className="container py-8 md:py-12 lg:py-24 bg-muted/40">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Choose Your Magic</h2>
             <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Simple plans built for creators.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={`flex flex-col bg-card transform-gpu transition-all duration-300 ease-out hover:scale-105 ${tier.popular ? 'border-primary shadow-2xl shadow-primary/20' : 'hover:shadow-lg'}`}>
                <div className="flex flex-col flex-1 p-6">
                  <CardHeader className="p-0">
                    <CardTitle className="flex justify-between items-baseline">
                      {tier.name}
                      {tier.popular && <span className="text-sm font-medium text-primary">Most Popular</span>}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.priceSuffix}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 p-0 pt-6">
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          {tier.name === 'Free' ? '✨' : '💎'}
                          <span className="ml-2 text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={tier.name === 'Pro' ? handleGoProClick : () => router.push(tier.ctaPath)}
                      className="w-full mt-auto"
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
            <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">Upgrade anytime. Cancel anytime. Magic stays forever.</p>
            </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container py-12">
            <div className="grid gap-8 md:grid-cols-3">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Logo className="h-6 w-6" />
                        <span className="font-bold text-lg">Magicpixa</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Your photo’s best friend. Powered by AI.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Quick Links</h4>
                    <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <Link href="#features" className="hover:text-foreground">Features</Link>
                        <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
                        <Link href="/about" className="hover:text-foreground">About Us</Link>
                    </nav>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Legal</h4>
                    <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <Link href="/terms" className="hover:text-foreground">Terms & Conditions</Link>
                        <Link href="/policy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/cancellation-refunds" className="hover:text-foreground">Cancellation & Refund Policy</Link>
                    </nav>
                </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                © 2025 Magicpixa. All rights reserved.
            </div>
        </div>
      </footer>
      <Button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-4 right-4 rounded-full p-2 h-12 w-12 transition-opacity duration-300",
          showScrollToTop ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        variant="outline"
        size="icon"
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </div>
  );
}
