
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
import { LogOut } from 'lucide-react';
import { useUser } from '@/firebase';
import { Skeleton } from './ui/skeleton';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-7 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">
              Magicpixa
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
          {loading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : user ? (
            <>
              <div className="flex flex-col gap-2 text-sm p-2">
                <div className="flex justify-between">
                    <span>Credits:</span>
                    <span className="font-semibold">{user.credits ?? 0}</span>
                </div>
                <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-semibold">Guest</span>
                </div>
              </div>
              <Button size="sm" className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90">Upgrade</Button>
            </>
          ) : (
             <div className="p-2 text-sm text-muted-foreground">
                <p>Authentication is disabled.</p>
            </div>
          )}
        </SidebarGroup>
        {loading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        ) : user ? (
          <div className="flex w-full items-center justify-between rounded-md p-2 hover:bg-sidebar-accent">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                {user.photoURL && <AvatarImage src={user.photoURL} />}
                <AvatarFallback>{user.displayName?.charAt(0) ?? 'G'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.displayName || 'Guest'}</span>
            </div>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
