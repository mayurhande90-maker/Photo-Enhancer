
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Briefcase, Image as ImageIcon, LogOut, Settings, CreditCard } from "lucide-react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
       <div className="space-y-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>Please log in to view your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <Card className="rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 p-8">
                 <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                        <AvatarImage src={user.photoURL ?? `https://i.pravatar.cc/150?u=${user.email}`} />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {user.displayName}!</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>
             <div className="grid gap-4 md:grid-cols-3 p-6 bg-card">
                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Credits Left</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.credits}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Creations</CardTitle>
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">in the last 7 days</p>
                    </CardContent>
                </Card>
                 <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Subscription Plan</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.planName}</div>
                    </CardContent>
                </Card>
            </div>
        </Card>

         <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto rounded-2xl p-2">
                <TabsTrigger value="overview" className="rounded-xl py-2">Overview</TabsTrigger>
                <TabsTrigger value="creations" className="rounded-xl py-2">My Creations</TabsTrigger>
                <TabsTrigger value="billing" className="rounded-xl py-2">Billing</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl py-2">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                        <p>No recent activity.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="creations" className="mt-6">
                 <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>My Creations</CardTitle>
                        <CardDescription>View all your generated images.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                        <p>Your gallery is empty.</p>
                        <Button asChild variant="link">
                            <Link href="/dashboard/creations">Go to My Creations</Link>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="billing" className="mt-6">
                 <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Billing Information</CardTitle>
                        <CardDescription>Manage your subscription and payment methods.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                        <p>You are on the <span className="font-semibold text-foreground">{user.planName}</span> plan.</p>
                        <Button asChild variant="link">
                            <Link href="/#pricing">Upgrade Plan</Link>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
                 <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                         <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                         <p>Settings page is under construction.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  )
}
