
'use client';

import { usePathname } from 'next/navigation';
import { features } from '@/lib/features';
import { Button } from './ui/button';
import { CreditCard, PanelLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { DashboardSidebar } from './dashboard-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';


function HeaderUserSection() {
    return (
        <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:flex items-center gap-2 rounded-2xl" disabled>
              <CreditCard className="h-4 w-4" /> 
               <span>0</span>
               Credits
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={'/placeholder-user.jpg'} alt={'User'} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="sm:hidden">
                        <div className="flex items-center justify-between w-full">
                            <span className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4" /> Credits
                            </span>
                            <span>0</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        My Creations
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>My Profile</DropdownMenuItem>
                     <DropdownMenuItem disabled>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function DashboardHeader() {
  const pathname = usePathname();
  const currentFeature = features.find((f) => f.path === pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden rounded-full">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0 bg-card border-r-0">
                <DashboardSidebar />
            </SheetContent>
        </Sheet>

        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
                </BreadcrumbItem>
                {currentFeature && (
                    <>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{currentFeature.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
      
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <ThemeToggle />
        <HeaderUserSection />
      </div>
    </header>
  );
}
