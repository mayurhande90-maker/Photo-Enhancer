
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
    ctaPath: '/dashboard',
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
    ctaPath: '/dashboard', // Should lead to a checkout page in a real app
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
                    Get 10 free image credits. No sign-up needed.
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
                    <Button asChild className="w-full mt-auto">
                      <Link href={tier.ctaPath}>{tier.cta}</Link>
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
                    </nav>
                </div>
                <div>
                     <h4 className="font-semibold mb-2">Follow Us</h4>
                    <div className="flex space-x-4">
                        {/* Placeholder icons */}
                        <Link href="#" className="text-muted-foreground hover:text-foreground">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-foreground">
                           <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.49-1.74.85-2.7 1.04C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.81 1.91 3.58-.7-.02-1.37-.21-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.01-.06C3.8 20.29 6.26 21 8.98 21c7.18 0 11.12-5.96 11.12-11.12 0-.17 0-.34-.01-.5A7.95 7.95 0 0 0 22.46 6z" /></svg>
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-foreground">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
                        </Link>
                    </div>
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

    