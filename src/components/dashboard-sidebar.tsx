'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { features } from '@/lib/features';
import { MoreHorizontal, LogOut } from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-7 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">
              PhotoCraft AI
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {features.map((feature) => (
            <SidebarMenuItem key={feature.name}>
              <Link href={feature.path}>
                <SidebarMenuButton
                  isActive={pathname === feature.path}
                  icon={<feature.icon />}
                  tooltip={{ children: feature.name }}
                >
                  {feature.name}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarGroup>
            <SidebarGroupLabel>My Account</SidebarGroupLabel>
            <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                    <span>Credits:</span>
                    <span className="font-semibold">5 / 500</span>
                </div>
                 <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-semibold">Free Trial</span>
                </div>
                 <div className="flex justify-between">
                    <span>Renews:</span>
                    <span className="font-semibold">N/A</span>
                </div>
            </div>
            <Button size="sm" className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90">Upgrade</Button>
        </SidebarGroup>
        <div className="flex w-full items-center justify-between rounded-md p-2 hover:bg-sidebar-accent">
            <div className="flex items-center gap-2">
                 <Avatar className="size-8">
                    <AvatarImage src="https://picsum.photos/seed/avatar/40/40" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">User</span>
            </div>
            <Button variant="ghost" size="icon" className="size-8">
                <LogOut className="size-4" />
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
