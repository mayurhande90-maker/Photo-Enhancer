
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { LogOut, User as UserIcon } from 'lucide-react';
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import { doc } from 'firebase/firestore';


export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ displayName: string; photoURL: string; }>(userProfileRef);

  const userCreditsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/creditBalance/balance`);
  }, [user, firestore]);
  const { data: creditsDoc, isLoading: isCreditsLoading } = useDoc<{ credits: number }>(userCreditsRef);

  const isLoading = isUserLoading || isProfileLoading || isCreditsLoading;

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
          {isLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : user ? (
            <>
              <div className="flex flex-col gap-2 text-sm p-2">
                <div className="flex justify-between">
                    <span>Credits:</span>
                    <span className="font-semibold">{creditsDoc?.credits ?? 0}</span>
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
                <p>Please log in to see your account details.</p>
            </div>
          )}
        </SidebarGroup>
        {isLoading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        ) : user && userProfile ? (
          <div className="flex w-full items-center justify-between rounded-md p-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                {userProfile.photoURL && <AvatarImage src={userProfile.photoURL} />}
                <AvatarFallback>{userProfile.displayName?.charAt(0) ?? <UserIcon />}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{userProfile.displayName || 'User'}</span>
            </div>
            <Button variant="ghost" size="icon" className="size-8" onClick={handleLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
            <div className="p-2">
                <Button asChild className="w-full">
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
