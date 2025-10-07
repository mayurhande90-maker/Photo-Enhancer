
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Wand2, Scissors, Camera, Palette, Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { BeforeAfterSlider } from '@/components/before-after-slider';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { createRazorpayOrder } from './auth/actions';
import { useToast } from '@/hooks/use-toast';

const features = [
  {
    name: 'Photo Enhancement',
    description: 'Fix lighting, colors, noise, and resolution automatically.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-enhance-before'),
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-enhance-after'),
    path: '/dashboard/enhance',
  },
  {
    name: 'Background Removal',
    description: 'Instantly remove backgrounds to get clean, transparent PNGs.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-background-before'),
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-background-after'),
    path: '/dashboard/background-removal',
  },
  {
    name: 'Photo Studio',
    description: 'Create e-commerce ready product shots with perfect lighting.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-studio-before'),
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-studio-after'),
    path: '/dashboard/studio',
  },
  {
    name: 'Photo Colorize',
    description: 'Bring old black and white photos to life with natural colors.',
    imageBefore: PlaceHolderImages.find((img) => img.id === 'feature-colorize-before'),
    imageAfter: PlaceHolderImages.find((img) => img.id === 'feature-colorize-after'),
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
    ctaPath: '/signup',
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
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const result = await createRazorpayOrder(499, 'INR');

    if (result.error || !result.order) {
      toast({
        title: 'Payment Error',
        description: result.error || 'Could not create a payment order.',
        variant: 'destructive'
      });
      return;
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Magicpixa</span>
          </Link>
          <nav className="hidden flex-1 items-center gap-6 text-sm md:flex">
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
            <Link href="#testimonials" className="text-muted-foreground transition-colors hover:text-foreground">Reviews</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="hidden items-center space-x-2 md:flex">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-10 md:py-20">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col items-start gap-4">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                Turn Any Photo Into Pure Magic.
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Remove backgrounds, enhance lighting, colorize memories, or make studio-ready product shots — all with one click.
              </p>
              <div className="flex flex-col items-start gap-4">
                  <Button asChild size="lg">
                    <Link href="/dashboard/enhance">Create Magic →</Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Try for free. No sign-up needed for your first image.
                  </p>
              </div>
            </div>
            <div className="relative w-full h-[450px]">
                <Carousel className="w-full h-full" plugins={[]} opts={{ loop: true }}>
                  <CarouselContent className="h-full">
                    {features.map((feature, index) => (
                      <CarouselItem key={index} className="h-full">
                        <div className="p-1 h-full">
                          <Card className="h-full overflow-hidden">
                            <CardContent className="relative p-0 h-full">
                              <BeforeAfterSlider
                                before={feature.imageBefore!.imageUrl}
                                after={feature.imageAfter!.imageUrl}
                              />
                               <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-semibold backdrop-blur-sm">
                                {feature.name}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
            </div>
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
                <Link href={feature.path} key={feature.title}>
                  <Card className="h-full transform-gpu transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" className="p-0">
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
                      asChild={tier.name === 'Free'} 
                      onClick={tier.name === 'Pro' ? handlePayment : undefined}
                      className="w-full mt-auto"
                    >
                      {tier.name === 'Free' ? <Link href={tier.ctaPath}>{tier.cta}</Link> : tier.cta}
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
    </div>
  );
}
