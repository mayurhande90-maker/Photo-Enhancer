
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { FeatureCard } from '@/components/feature-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Wand2, Scissors, Camera, Palette, Check, Star } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/before-after-slider';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const features = [
  {
    icon: <Wand2 className="size-8 text-primary" />,
    title: 'Photo Enhancement',
    description: 'Fix lighting, colors, noise, and resolution automatically.',
    image: PlaceHolderImages.find((img) => img.id === 'feature-enhance'),
  },
  {
    icon: <Scissors className="size-8 text-primary" />,
    title: 'Background Removal',
    description: 'Instantly remove backgrounds to get clean, transparent PNGs.',
    image: PlaceHolderImages.find((img) => img.id === 'feature-background'),
  },
  {
    icon: <Camera className="size-8 text-primary" />,
    title: 'Photo Studio',
    description: 'Create e-commerce ready product shots with perfect lighting.',
    image: PlaceHolderImages.find((img) => img.id === 'feature-studio'),
  },
  {
    icon: <Palette className="size-8 text-primary" />,
    title: 'Photo Colorize',
    description: 'Bring old black and white photos to life with natural colors.',
    image: PlaceHolderImages.find((img) => img.id === 'feature-colorize'),
  },
];

const pricingTiers = [
  {
    name: 'Free',
    price: '₹0',
    priceSuffix: '/ month',
    features: [
      '10 image enhancements per month',
      'Basic AI enhancements',
      'Watermark on images',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Premium',
    price: '₹999',
    priceSuffix: '/ month',
    features: [
      '200 image enhancements per month',
      'Advanced AI enhancements (studio lighting, color correction, upscaling)',
      'No watermark',
      'Priority support',
    ],
    cta: 'Upgrade Now',
    popular: true,
  },
];

const testimonials = [
    {
      name: 'Priya S.',
      title: 'Photographer',
      quote: "Magicpixa has been a game-changer for my workflow. The photo enhancement tool saves me hours of manual editing, and the results are consistently stunning.",
      rating: 5,
    },
    {
      name: 'Rohan M.',
      title: 'E-commerce Store Owner',
      quote: "The background removal and photo studio features are incredible. My product shots have never looked better, and my sales have increased by 20%!",
      rating: 5,
    },
    {
      name: 'Ananya K.',
      title: 'Genealogy Hobbyist',
      quote: "I'm restoring my family's old photo albums, and the colorization tool is pure magic. Seeing my ancestors in color for the first time was an emotional experience.",
      rating: 5,
    },
]

const heroSlides = [
  {
    title: 'Photo Enhancement',
    before: PlaceHolderImages.find((img) => img.id === 'feature-enhance-before'),
    after: PlaceHolderImages.find((img) => img.id === 'feature-enhance-after'),
  },
  {
    title: 'Background Removal',
    before: PlaceHolderImages.find((img) => img.id === 'feature-background-before'),
    after: PlaceHolderImages.find((img) => img.id === 'feature-background-after'),
  },
  {
    title: 'Photo Studio',
    before: PlaceHolderImages.find((img) => img.id === 'feature-studio-before'),
    after: PlaceHolderImages.find((img) => img.id === 'feature-studio-after'),
  },
  {
    title: 'Photo Colorize',
    before: PlaceHolderImages.find((img) => img.id === 'feature-colorize-before'),
    after: PlaceHolderImages.find((img) => img.id === 'feature-colorize-after'),
  },
];


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Magicpixa</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col items-start gap-4">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                AI that brings your photos to life.
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Enhance, remove backgrounds, create stunning product shots, and colorize old photos with a single click. Get 10 free credits monthly.
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard">Enhance Your First Photo</Link>
              </Button>
            </div>
            <div className="relative w-full">
               <Carousel className="w-full" opts={{ loop: true }} plugins={[]}>
                  <CarouselContent>
                    {heroSlides.map((slide, index) => (
                      <CarouselItem key={index}>
                        <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-2xl">
                          <Card className='h-full'>
                            {slide.before && slide.after && (
                              <BeforeAfterSlider
                                before={slide.before.imageUrl}
                                after={slide.after.imageUrl}
                              />
                            )}
                             <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-3 py-1.5 text-sm font-semibold text-white">
                                {slide.title}
                            </div>
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
        <section id="features" className="container space-y-6 bg-slate-50/50 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Explore the powerful AI tools that will transform your images and streamline your creative workflow.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>
        <section id="testimonials" className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Loved by Creators Worldwide</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              See what our users are saying about Magicpixa.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
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
        </section>
        <section id="pricing" className="container py-8 md:py-12 lg:py-24 bg-slate-50/50">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Enhance Your Photos with AI — Fast, Easy, Stunning</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Bring Your Photos to Life — Free & Premium Plans Available
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={`flex flex-col bg-card ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                <div className="flex flex-col flex-1">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-baseline">
                      {tier.name}
                      {tier.popular && <span className="text-sm font-medium text-primary">Most Popular</span>}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.priceSuffix}</span>
                    </CardDescription>
                  </CardHeader>
                  <div className="flex flex-col flex-1 p-6 pt-0">
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-auto">
                      {tier.cta}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
            <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">Cancel anytime. Upgrade or downgrade whenever you want.</p>
            </div>
        </section>
      </main>
      <footer className="container">
        <div className="flex flex-col items-center justify-between gap-4 border-t py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo className="h-6 w-6" />
            <p className="text-center text-sm leading-loose md:text-left">
              Built by Magicpixa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
