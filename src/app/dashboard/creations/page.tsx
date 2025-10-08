
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { GeneratedImage } from '@/lib/types';
import { collection, orderBy, query } from 'firebase/firestore';
import { ImageIcon, Loader2, Download, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';

function CreationCard({ image }: { image: GeneratedImage }) {
    const displayUrl = image.processedImageUrl || image.originalImageUrl;

    return (
        <Card className="overflow-hidden group relative rounded-3xl transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-accent/20">
            <CardContent className="p-0">
                <a href={displayUrl} target="_blank" rel="noopener noreferrer">
                    <div className="relative aspect-[4/3] w-full bg-muted">
                        {displayUrl ? (
                            <Image
                                src={displayUrl}
                                alt={image.processingType}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </a>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="font-semibold text-white truncate">{image.processingType}</h3>
                    <p className="text-sm text-white/80">
                        {image.createdAt ? formatDistanceToNow(new Date(image.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                    </p>
                </div>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button asChild variant="secondary" size="icon" className="h-9 w-9 rounded-full" disabled={!displayUrl}>
                    <a href={displayUrl} download={`magicpixa-creation-${image.id}.png`}>
                        <Download className="h-4 w-4"/>
                    </a>
                </Button>
                <Button variant="destructive" size="icon" className="h-9 w-9 rounded-full" disabled>
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>
        </Card>
    )
}

export default function CreationsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const creationsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, `users/${user.uid}/generatedImages`),
            orderBy('createdAt', 'desc')
        );
    }, [user, firestore]);

    const { data: images, isLoading: imagesLoading } = useCollection<GeneratedImage>(creationsQuery);

    if (userLoading || imagesLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto text-center">
                 <Alert variant="destructive">
                    <ImageIcon className="h-4 w-4" />
                    <AlertTitle>Log in to see your creations</AlertTitle>
                    <AlertDescription>
                      The "My Creations" gallery is where your generated images are saved.
                      Please <Link href="/login" className='underline font-semibold'>log in</Link> or <Link href="/signup" className='underline font-semibold'>sign up</Link> to get started.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

     const renderEmptyState = () => (
         <div className="text-center border-2 border-dashed rounded-3xl p-12 space-y-4">
            <div className="mx-auto w-fit bg-primary/10 p-4 rounded-2xl text-primary">
                <ImageIcon className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold">Your gallery is empty</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't created any images yet. Head over to the dashboard to start bringing your ideas to life!
            </p>
            <Button asChild>
                <Link href="/dashboard">Start Creating</Link>
            </Button>
        </div>
     )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Creations</h1>
                    <p className="text-muted-foreground mt-1">
                        A gallery of your magical transformations.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search creations..." className="pl-9 w-full" disabled />
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" disabled>Filter</Button>
                        </DropdownMenuTrigger>
                    </DropdownMenu>
                </div>
            </div>
            
            {(!images || images.length === 0) ? (
                renderEmptyState()
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {images.map((image) => (
                        <CreationCard key={image.id} image={image} />
                    ))}
                </div>
            )}
        </div>
    )
}
