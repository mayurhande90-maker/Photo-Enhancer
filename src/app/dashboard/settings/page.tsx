
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {

  return (
    <div className="space-y-8 max-w-2xl">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, appearance, and notification settings.</p>
      </div>

      <div className="text-center p-8 border-2 border-dashed rounded-3xl">
        <h2 className="text-2xl font-bold">Feature Disabled</h2>
        <p className="text-muted-foreground mt-2">User accounts and settings are currently disabled.</p>
      </div>

      <Card className="rounded-2xl opacity-50">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others would see you on the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={'User Name'} readOnly />
          </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={'user@example.com'} readOnly />
          </div>
          <Button disabled>Edit Profile</Button>
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

       <Card className="rounded-2xl border-destructive opacity-50">
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
