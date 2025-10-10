
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { features, featureCategories } from '@/lib/features';
import { Home, Settings, Image as CreationsIcon, Megaphone, Briefcase, Sparkles, Star as StarIcon, Image as ImageStudioIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';


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

const categorizedFeatures = Object.entries(featureCategories).map(([key, name]) => ({
  key,
  name,
  icon: categoryIcons[name],
  features: features.filter(f => f.category === name)
}));


export function DashboardSidebar() {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<string[]>(
    categorizedFeatures.map(c => c.key)
  );

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(k => k !== categoryKey)
        : [...prev, categoryKey]
    );
  };
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card text-card-foreground sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
          <span className="text-lg">Magicpixa</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid items-start gap-1 p-2 text-sm font-medium">
          {mainNav.map((item) => (
            <Link key={item.name} href={item.path} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              pathname === item.path 
                ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}>
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          
          <div className="my-2 h-px bg-border" />

          {categorizedFeatures.map((category) => (
            <Collapsible 
              key={category.key} 
              className="grid gap-1"
              open={openCategories.includes(category.key)}
              onOpenChange={() => toggleCategory(category.key)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold rounded-lg bg-accent/50 text-accent-foreground hover:bg-accent cursor-pointer">
                  <span className="flex items-center gap-3 font-bold">
                    <category.icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{category.name}</span>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openCategories.includes(category.key) && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid gap-1 py-1">
                  {category.features.map((feature) => (
                    <Link key={feature.name} href={feature.isComingSoon ? '#' : feature.path} className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm",
                       pathname === feature.path 
                        ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                       feature.isComingSoon && "opacity-50 cursor-not-allowed"
                    )}>
                      <feature.icon className="h-4 w-4" />
                      <span className="whitespace-nowrap">{feature.name}</span>
                      {feature.isComingSoon && <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded-md">Soon</span>}
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

        </nav>
      </ScrollArea>
       <div className="mt-auto p-2 border-t">
          <Link href="/dashboard/settings" className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/dashboard/settings" 
              ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
      </div>
    </aside>
  );
}
