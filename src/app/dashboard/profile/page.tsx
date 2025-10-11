
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Edit } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center p-8 border-2 border-dashed rounded-3xl">
          <h1 className="text-2xl font-bold">Feature Disabled</h1>
          <p className="text-muted-foreground mt-2">User profiles and authentication are currently disabled.</p>
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 opacity-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={'/placeholder-user.jpg'} alt={'User'}/>
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold">User Name</h1>
                        <p className="text-muted-foreground">user@example.com</p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <Button disabled className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </div>
            </div>
        </Card>

        <Card className="rounded-3xl opacity-50">
            <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>This is how your profile would appear to others.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-start gap-4">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <h4 className="font-semibold">Bio</h4>
                        <p className="text-muted-foreground">A short bio would appear here.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
