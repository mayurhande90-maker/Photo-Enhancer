
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Feature } from '@/lib/types';
import { features } from '@/lib/features';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BeforeAfterSlider } from './before-after-slider';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Clock, User, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCredit } from '@/hooks/use-credit';
import { useUser, useFirestore } from '@/firebase';
import { saveGeneratedImageClient } from '@/firebase/images';

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
  const { toast } = useToast();
  const { user, loading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const { credits, isLoading: isCreditLoading, consumeCredits } = useCredit();

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (!originalFile || !user || !originalDataUri || !firestore) return;
    
    if (!isCreditLoading && credits < feature.creditCost) {
        toast({
            title: 'Not Enough Credits',
            description: `You don't have enough credits for this operation.`,
            variant: 'destructive',
        });
        return;
    }

    setIsProcessing(true);
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
    }, 500);

    try {
      const dataUri = originalDataUri;
      // 1. Call the server action to process the image
      const result = await feature.action(dataUri, user.uid);
      
      // 2. Set the result for display
      setProcessedImageUrl(result.enhancedPhotoDataUri);

      // 3. Save the image data to Firestore on the client
      if (result.enhancedPhotoDataUri) {
        await saveGeneratedImageClient(
            firestore,
            user.uid,
            dataUri,
            result.enhancedPhotoDataUri,
            feature.name
        );
      }
      
      // 4. Consume credits
      await consumeCredits(feature.creditCost);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      toast({
          title: 'Processing Error',
          description: err instanceof Error ? err.message : 'Could not process the image.',
          variant: 'destructive'
      });
    } finally {
      clearInterval(loadingInterval);
      setProgress(100);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalDataUri(null);
    setProcessedImageUrl(null);
    setError(null);
    setIsProcessing(false);
    setProgress(0);
  };
  
  const renderQuotaAlert = () => {
    if (isUserLoading || isCreditLoading) return null;
    
    const noCredits = credits < feature.creditCost;

    if (!user && noCredits) {
      return (
        <Alert variant="destructive" className="mt-4">
          <User className="h-4 w-4" />
          <AlertTitle>Sign Up for More Credits</AlertTitle>
          <AlertDescription>
              You've used your free credit. Please <Link href="/signup" className="underline font-bold">create an account</Link> to continue.
          </AlertDescription>
        </Alert>
      )
    }

    if (user && noCredits) {
      return (
         <Alert variant="destructive" className="mt-4">
          <Clock className="h-4 w-4" />
          <AlertTitle>Not Enough Credits</AlertTitle>
          <AlertDescription>
              You don't have enough credits for this action. Upgrade to the Pro plan for more credits.
          </AlertDescription>
        </Alert>
      )
    }

    return null;
  }

  const renderResultView = () => {
    if (!processedImageUrl || !originalDataUri) return null;

    if (feature.showBeforeAfterSlider) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <BeforeAfterSlider
            before={originalDataUri}
            after={processedImageUrl}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={originalDataUri}
            alt="Original upload"
            fill
            className="object-contain"
          />
          <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Original Image
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={processedImageUrl}
            alt="Processed result"
            fill
            className="object-contain"
          />
           <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Magic Image
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle className="pl-6">
          How it works
        </AlertTitle>
        <AlertDescription className="pt-2 pl-6">
          {feature.description} This costs {feature.creditCost} credit(s).
        </AlertDescription>
      </Alert>
      <Card>
        <CardContent className="p-4 md:p-6">
          {!user && isUserLoading ? (
             <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !originalFile ? (
            <FileUploader onFileSelect={handleFileSelect} />
          ) : (
            <div className="space-y-4">
              
              {originalDataUri && !processedImageUrl && !isProcessing && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={originalDataUri}
                    alt="Original upload"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              
              {renderResultView()}

              {isProcessing && (
                <div className="space-y-2 text-center">
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                  <p className="text-lg text-muted-foreground">Magic in progress... Please wait.</p>
                  <Progress value={progress} className="w-full max-w-sm mx-auto" />
                </div>
              )}

              {error && !isProcessing && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {!isProcessing && renderQuotaAlert()}

              <div className="flex flex-wrap gap-2">
                {!isProcessing && !processedImageUrl && (
                  <Button onClick={handleProcessImage} disabled={!user || isCreditLoading || credits < feature.creditCost}>
                    <Loader2 className={`mr-2 h-4 w-4 animate-spin ${isProcessing ? 'inline-block' : 'hidden'}`} />
                    Process Image ({feature.creditCost} credit)
                  </Button>
                )}
                
                {processedImageUrl && (
                    <Button asChild>
                        <a href={processedImageUrl} download={`magicpixa-${feature.name.toLowerCase().replace(/\s+/g, '-')}.png`}>
                            Download Magic Image
                        </a>
                    </Button>
                )}

                <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                  Try Another Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-sm text-muted-foreground">
        {isUserLoading || isCreditLoading ? (
            <p>Loading user information...</p>
        ) : user ? (
            <p>You have {credits} credits left.</p>
        ) : (
            <p>
                Please{' '}
                <Link href="/login" className="underline">
                    sign in
                </Link>{' '}
                to start creating images.
            </p>
        )}
      </div>
    </div>
  );
}
