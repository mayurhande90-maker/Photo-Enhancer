
'use client';

import { useState } from 'react';
import type { Feature } from '@/lib/types';
import { features } from '@/lib/features';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BeforeAfterSlider } from './before-after-slider';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

interface ImageProcessorViewProps {
  featureName: Feature['name'];
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageProcessorView({ featureName }: ImageProcessorViewProps) {
  const feature = features.find((f) => f.name === featureName);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userCreditsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/creditBalance/balance`);
  }, [user, firestore]);
  
  const { data: creditsDoc } = useDoc<{ credits: number }>(userCreditsRef);


  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  if (!feature) {
    return <div>Feature not found.</div>;
  }

  const handleFileSelect = (file: File) => {
    setOriginalFile(file);
    fileToDataUri(file).then(setOriginalDataUri);
    setProcessedImageUrl(null);
    setError(null);
  };

  const handleProcessImage = async () => {
    if (!originalFile || !user) return;
    const currentCredits = creditsDoc?.credits ?? 0;

    if (currentCredits < feature.creditCost) {
        toast({
            title: 'Insufficient Credits',
            description: `You need ${feature.creditCost} credits to use this feature. Please upgrade your plan.`,
            variant: 'destructive',
        });
        return;
    }


    setIsLoading(true);
    setError(null);
    setProgress(0);

    const loadingInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 95) {
                clearInterval(loadingInterval);
                return 95;
            }
            return prev + 5;
        });
    }, 200);

    try {
      const dataUri = await fileToDataUri(originalFile);
      const result = await feature.action(dataUri, user.uid);
      setProcessedImageUrl(result.enhancedPhotoDataUri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      clearInterval(loadingInterval);
      setProgress(100);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalDataUri(null);
    setProcessedImageUrl(null);
    setError(null);
    setIsLoading(false);
    setProgress(0);
  };

  if (!user) {
    return (
        <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Please Log In</AlertTitle>
            <AlertDescription>
                You need to be logged in to use this feature. <Link href="/login" className="font-bold underline">Login now</Link>.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          {feature.description} This costs {feature.creditCost} credit(s).
        </AlertDescription>
      </Alert>
      <Card>
        <CardContent className="p-4 md:p-6">
          {!originalFile && <FileUploader onFileSelect={handleFileSelect} />}

          {originalDataUri && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                {processedImageUrl ? (
                    feature.showBeforeAfterSlider ? (
                    <BeforeAfterSlider
                      before={originalDataUri}
                      after={processedImageUrl}
                    />
                  ) : (
                    <Image
                      src={processedImageUrl}
                      alt="Processed result"
                      fill
                      className="object-contain"
                    />
                  )
                ) : (
                  <Image
                    src={originalDataUri}
                    alt="Original upload"
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Processing... Please wait.</p>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                {!isLoading && !processedImageUrl && (
                  <Button onClick={handleProcessImage} disabled={!user || (creditsDoc?.credits ?? 0) < feature.creditCost}>
                    Process Image ({feature.creditCost} credit)
                  </Button>
                )}
                
                {processedImageUrl && (
                    <Button asChild>
                        <a href={processedImageUrl} download={`magicpixa-${feature.name.toLowerCase().replace(' ','-')}.png`}>
                            Download
                        </a>
                    </Button>
                )}

                <Button variant="outline" onClick={handleReset}>
                  Try Another Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
