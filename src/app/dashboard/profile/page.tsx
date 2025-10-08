
'use client'

import { useState } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useStorage } from "@/firebase";
import { updateUserProfile } from "@/firebase/auth/update-profile";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Award, Briefcase, Image as ImageIcon, MapPin, Loader2, Edit, Camera, User } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot be longer than 50 characters." }),
  bio: z.string().max(150, { message: "Bio cannot be longer than 150 characters." }).optional(),
  location: z.string().max(50, { message: "Location cannot be longer than 50 characters." }).optional(),
  profession: z.string().max(50, { message: "Profession cannot be longer than 50 characters." }).optional(),
  photoFile: z.instanceof(File).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfileForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      bio: (user as any)?.bio || "",
      location: (user as any)?.location || "",
      profession: (user as any)?.profession || "",
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user || !firestore || !storage) return;

    setIsSaving(true);
    try {
      await updateUserProfile(firestore, storage, user, data);
      toast({ title: "✅ Profile updated successfully" });
      setOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "⚠️ Failed to update profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photoFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={photoPreview || (user?.uid ? `https://i.pravatar.cc/150?u=${user.uid}`: '')} />
                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Label htmlFor="photo-upload" className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110">
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Change profile picture</span>
                </Label>
                <Input id="photo-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handlePhotoChange} />
            </div>
        </div>

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Aarav Sharma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Filmmaker & Creator" className="resize-none" {...field} maxLength={150}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Pune, India" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
              <FormControl>
                <Input placeholder="Entrepreneur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EditProfileDialog() {
    const { user } = useUser();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl p-0">
                     <SheetHeader className="p-6 pb-0">
                        <SheetTitle>Edit Your Profile</SheetTitle>
                    </SheetHeader>
                    <div className="p-6 overflow-y-auto max-h-[80svh]">
                        <ProfileForm setOpen={setOpen} />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Your Profile</DialogTitle>
                </DialogHeader>
                <ProfileForm setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    );
}


export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
       <div className="space-y-8">
        <Card className="rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-3 text-center sm:text-left">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>
        </Card>
        <Card className="rounded-3xl p-8">
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </Card>
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
  
  const appUser = user as any;
  const photoSrc = user.photoURL || (user.uid ? `https://i.pravatar.cc/150?u=${user.uid}` : '');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        {photoSrc ? <AvatarImage src={photoSrc} /> : <User className="h-16 w-16"/>}
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold">{user.displayName}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <EditProfileDialog />
                </div>
            </div>
        </Card>

        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>This is how your profile appears to others.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {appUser.bio && (
                    <div className="flex items-start gap-4">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                            <h4 className="font-semibold">Bio</h4>
                            <p className="text-muted-foreground">{appUser.bio}</p>
                        </div>
                    </div>
                 )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appUser.profession && (
                        <div className="flex items-start gap-4">
                            <Award className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                                <h4 className="font-semibold">Profession</h4>
                                <p className="text-muted-foreground">{appUser.profession}</p>
                            </div>
                        </div>
                    )}
                    {appUser.location && (
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                                <h4 className="font-semibold">Location</h4>
                                <p className="text-muted-foreground">{appUser.location}</p>
                            </div>
                        </div>
                    )}
                 </div>
            </CardContent>
        </Card>
    </div>
  )
}
