
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { features, featureCategories } from '@/lib/features';
import { Home, Settings, Image as CreationsIcon, Megaphone, Briefcase, Sparkles, Star as StarIcon, Image as ImageStudioIcon, Palette, Users } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const categoryIcons = {
  [featureCategories.IMAGE_STUDIO]: ImageStudioIcon,
  [featureCategories.CONTENT_BRAND]: Megaphone,
  [featureCategories.SMART_OFFICE]: Briefcase,
  [featureCategories.PERSONAL_MAGIC]: Sparkles,
  [featureCategories.PREMIUM]: StarIcon,
};


export function DashboardSidebar() {
  const pathname = usePathname();
  const categories = Object.values(featureCategories);
  const categorizedFeatures = categories.map(category => ({
      name: category,
      features: features.filter(f => f.category === category)
  }));


  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 sm:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
              <span className="text-lg">Magicpixa</span>
          </Link>
      </div>
        <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-1 p-2">
                <Link
                    href="/dashboard"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        pathname === '/dashboard'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                </Link>
                <Link
                    href="/dashboard/creations"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        pathname === '/dashboard/creations'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <CreationsIcon className="h-5 w-5" />
                    <span>My Creations</span>
                </Link>
                 <Accordion type="multiple" defaultValue={categories} className="w-full">
                    {categorizedFeatures.map(({ name, features: categoryFeatures }) => {
                        const CategoryIcon = categoryIcons[name];
                        if (categoryFeatures.length === 0) return null;
                        
                        return (
                            <AccordionItem value={name} key={name} className="border-b-0">
                                <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:no-underline">
                                    <CategoryIcon className="h-5 w-5" />
                                    <span>{name}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pl-4">
                                    {categoryFeatures.map((feature) => (
                                        <Link
                                        href={feature.isComingSoon || feature.isPremium ? '#' : feature.path}
                                        key={feature.name}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm',
                                            pathname === feature.path
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                            (feature.isComingSoon || feature.isPremium) && 'opacity-50 pointer-events-none'
                                        )}
                                        >
                                        <feature.icon className="h-4 w-4" />
                                        <span>{feature.name}</span>
                                        </Link>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </nav>
        </ScrollArea>
        <div className="mt-auto flex flex-col items-start gap-2 p-4 border-t">
            <Link
                href="/dashboard/settings"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
            </Link>
        </div>
    </aside>
  );
}
