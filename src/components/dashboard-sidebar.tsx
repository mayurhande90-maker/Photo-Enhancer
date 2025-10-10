
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { features, featureCategories } from '@/lib/features';
import { Home, Settings, Image as CreationsIcon, Megaphone, Briefcase, Sparkles, Star as StarIcon, Image as ImageStudioIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mainNav = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'My Creations', path: '/dashboard/creations', icon: CreationsIcon },
];

const categoryIcons = {
  [featureCategories.IMAGE_STUDIO]: ImageStudioIcon,
  [featureCategories.CONTENT_BRAND]: Megaphone,
  [featureCategories.SMART_OFFICE]: Briefcase,
  [featureCategories.PERSONAL_MAGIC]: Sparkles,
  [featureCategories.PREMIUM]: StarIcon,
};

const categorizedFeatures = Object.values(featureCategories).map(category => ({
  name: category,
  icon: categoryIcons[category],
  features: features.filter(f => f.category === category)
}));

export function DashboardSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-card sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
          <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">Magicpixa</span>
        </Link>
        <TooltipProvider>
          {mainNav.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link href={item.path} className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                  pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
          ))}
          
          <div className="w-full h-px bg-border my-2" />

          {categorizedFeatures.flatMap(category => 
             category.features.map((feature) => (
                <Tooltip key={feature.name}>
                    <TooltipTrigger asChild>
                         <Link href={feature.path} className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                           pathname === feature.path ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                           feature.isComingSoon && "pointer-events-none opacity-50"
                        )}>
                          <feature.icon className="h-5 w-5" />
                          <span className="sr-only">{feature.name}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{feature.name}</TooltipContent>
                </Tooltip>
             ))
          )}

        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard/settings" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
