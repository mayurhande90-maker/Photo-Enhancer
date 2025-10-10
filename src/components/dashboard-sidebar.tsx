
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { features, featureCategories } from '@/lib/features';
import { Home, Settings, Image as CreationsIcon, Megaphone, Briefcase, Sparkles, Star as StarIcon, Image as ImageStudioIcon, Palette, Users, Clock, PanelRight, PanelLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from './ui/sidebar';

const categoryIcons = {
  [featureCategories.IMAGE_STUDIO]: ImageStudioIcon,
  [featureCategories.CONTENT_BRAND]: Megaphone,
  [featureCategories.SMART_OFFICE]: Briefcase,
  [featureCategories.PERSONAL_MAGIC]: Sparkles,
  [featureCategories.PREMIUM]: StarIcon,
};


export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const categories = Object.values(featureCategories);
  
  const activeFeatures = features.filter(f => !f.isComingSoon);
  const comingSoonFeatures = features.filter(f => f.isComingSoon);

  const categorizedFeatures = categories.reduce((acc, category) => {
    const categoryFeatures = activeFeatures.filter(f => f.category === category);
    if (categoryFeatures.length > 0) {
      acc.push({ name: category, features: categoryFeatures });
    }
    return acc;
  }, [] as { name: string; features: typeof features }[]);


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-16 p-3 flex items-center">
        <Link href="/" className={cn("flex items-center gap-2 font-semibold transition-opacity duration-300", state === 'collapsed' ? "opacity-0 w-0" : "opacity-100")}>
            <Logo className="h-7 w-7 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text" />
            <span className="text-lg">Magicpixa</span>
        </Link>
        <div className={cn("flex items-center", state === 'expanded' ? 'ml-auto' : 'mx-auto')}>
            <SidebarTrigger className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
                {state === 'expanded' ? <PanelLeft className="h-5 w-5"/> : <PanelRight className="h-5 w-5"/>}
            </SidebarTrigger>
        </div>
      </SidebarHeader>
        <SidebarContent className="p-2 flex-1 overflow-y-auto">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
                        <Link href="/dashboard"><Home /><span>Dashboard</span></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/creations'} tooltip="My Creations">
                        <Link href="/dashboard/creations"><CreationsIcon /><span>My Creations</span></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            
            <div className={cn("my-4 transition-opacity duration-300", state === 'collapsed' ? 'opacity-0 h-0' : 'opacity-100')}>
                <p className="px-3 text-xs font-semibold text-muted-foreground/80 tracking-wider">TOOLS</p>
            </div>

             {categorizedFeatures.map(({ name, features: categoryFeatures }) => {
                const CategoryIcon = categoryIcons[name as keyof typeof categoryIcons];
                return (
                    <SidebarMenu key={name}>
                        {categoryFeatures.map((feature) => (
                            <SidebarMenuItem key={feature.name}>
                                <SidebarMenuButton 
                                    asChild
                                    isActive={pathname === feature.path} 
                                    tooltip={feature.name}
                                    disabled={feature.isComingSoon || feature.isPremium}
                                >
                                    <Link href={feature.path}>
                                        <feature.icon />
                                        <span>{feature.name}</span>
                                        {(feature.isComingSoon || feature.isPremium) && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                )
             })}
             {comingSoonFeatures.length > 0 && (
                <>
                <div className={cn("my-4 transition-opacity duration-300", state === 'collapsed' ? 'opacity-0 h-0' : 'opacity-100')}>
                     <p className="px-3 text-xs font-semibold text-muted-foreground/80 tracking-wider">COMING SOON</p>
                </div>
                <SidebarMenu>
                    {comingSoonFeatures.map((feature) => (
                        <SidebarMenuItem key={feature.name}>
                            <SidebarMenuButton tooltip={feature.name} disabled>
                                <feature.icon />
                                <span>{feature.name}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                </>
             )}
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard/settings'} tooltip="Settings">
                        <Link href="/dashboard/settings">
                            <Settings/>
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
