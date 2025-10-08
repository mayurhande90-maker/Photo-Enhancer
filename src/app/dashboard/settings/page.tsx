
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { user, loading } = useUser();

  const handleUpdateProfile = () => {
    // Redirect to profile page for editing
    window.location.href = '/dashboard/profile';
  };


  if (loading) {
    return (
       <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Card className="rounded-2xl">
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>Please log in to view your settings.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, appearance, and notification settings.</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others will see you on the site. Click below to edit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={user.displayName || ''} readOnly />
          </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email || ''} readOnly />
          </div>
          <Button onClick={handleUpdateProfile}>Edit Profile</Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
       <Card className="rounded-2xl border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                  <Label>Delete Account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all your data. This action cannot be undone.</p>
                </div>
                 <Button variant="destructive" disabled>Delete My Account</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
