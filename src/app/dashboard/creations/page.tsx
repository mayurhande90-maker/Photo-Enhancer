
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { GeneratedImage } from '@/lib/types';
import { collection, orderBy, query } from 'firebase/firestore';
import { ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

function CreationCard({ image }: { image: GeneratedImage }) {
    return (
        <Card className="overflow-hidden group">
            <CardContent className="p-0">
                <a href={image.processedImageUrl} target="_blank" rel="noopener noreferrer">
                    <div className="relative aspect-[4/3] w-full">
                        <Image
                            src={image.processedImageUrl}
                            alt={image.processingType}
                            fill
                            className="object-contain"
                        />
                    </div>
                </a>
                <div className="p-4">
                    <h3 className="font-semibold">{image.processingType}</h3>
                    <p className="text-sm text-muted-foreground">
                        {image.createdAt ? formatDistanceToNow(new Date(image.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                    </p>
                </div>
            </CardContent>
            <div className="p-4 pt-0">
                 <Button asChild variant="secondary" size="sm" className="w-full">
                    <a href={image.processedImageUrl} download={`magicpixa-creation-${image.id}.png`}>
                        Download Image
                    </a>
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
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Creations</h1>
                </div>
                 <Alert>
                    <ImageIcon className="h-4 w-4" />
                    <AlertTitle>Log in to see your creations</AlertTitle>
                    <AlertDescription>
                      The "My Creations" gallery requires a user account to save and display images.
                      Please <Link href="/login" className='underline'>log in</Link> or <Link href="/signup" className='underline'>sign up</Link> to get started.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!images || images.length === 0) {
         return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Creations</h1>
                    <p className="text-muted-foreground">
                        Your generated images will appear here.
                    </p>
                </div>
                 <Alert>
                    <ImageIcon className="h-4 w-4" />
                    <AlertTitle>Your gallery is empty</AlertTitle>
                    <AlertDescription>
                      You haven't created any images yet. Head over to the <Link href="/dashboard" className='underline'>dashboard</Link> to start creating some magic!
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Creations</h1>
                <p className="text-muted-foreground">
                    A gallery of your magical transformations.
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((image) => (
                    <CreationCard key={image.id} image={image} />
                ))}
            </div>
        </div>
    )
}
