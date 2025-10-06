import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { FeatureCard } from '@/components/feature-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Wand2, Scissors, Camera, Palette } from 'lucide-react';

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

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">PhotoCraft AI</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button asChild variant="ghost">
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started Free</Link>
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
                Enhance, remove backgrounds, create stunning product shots, and colorize old photos with a single click. Start with 5 free credits.
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard">Enhance Your First Photo</Link>
              </Button>
            </div>
            <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-lg shadow-2xl">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
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
      </main>
      <footer className="container">
        <div className="flex flex-col items-center justify-between gap-4 border-t py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo className="h-6 w-6" />
            <p className="text-center text-sm leading-loose md:text-left">
              Built by Your Name. The source code is available on GitHub.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
