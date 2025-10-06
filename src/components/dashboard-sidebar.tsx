
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
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { features } from '@/lib/features';
import { Home } from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();

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
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/">
                    <SidebarMenuButton icon={<Home />}>Back to Home</SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
