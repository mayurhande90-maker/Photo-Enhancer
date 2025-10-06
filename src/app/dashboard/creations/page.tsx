
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { GeneratedImage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Image as ImageIcon, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

function CreationsGallery() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const creationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/generatedImages`);
  }, [user, firestore]);

  const { data: images, isLoading, error } = useCollection<GeneratedImage>(creationsQuery);

  if (isUserLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>
          You must be logged in to view your creations.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Creations</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!images || images.length === 0) {
    return (
      <Alert>
        <ImageIcon className="h-4 w-4" />
        <AlertTitle>No Creations Yet</AlertTitle>
        <AlertDescription>
          Your generated images will appear here once you start creating.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="relative aspect-square w-full">
            <Image
              src={image.processedImageUrl}
              alt={image.processingType}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-2 text-sm text-muted-foreground">
            {image.processingType}
          </div>
        </Card>
      ))}
    </div>
  );
}


export default function CreationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Creations</h1>
                <p className="text-muted-foreground">
                    Here are all the images you've generated with Magicpixa.
                </p>
            </div>
            <CreationsGallery />
        </div>
    )
}
