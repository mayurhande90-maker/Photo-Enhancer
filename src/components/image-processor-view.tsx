
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Feature } from '@/lib/types';
import { features } from '@/lib/features';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BeforeAfterSlider } from './before-after-slider';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Clock, User, Loader2, Download, RefreshCw, Wand2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCredit } from '@/hooks/use-credit';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { saveGeneratedImageClient } from '@/firebase/images';
import { Skeleton } from '@/components/ui/skeleton';

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
  const storage = useStorage();
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
    if (!originalFile || !user || !originalDataUri || !firestore || !storage) return;
    
    if (!isCreditLoading && credits < feature.creditCost) {
        toast({
            title: 'Not Enough Credits',
            description: `You don't have enough credits for this operation. Upgrade your plan for more.`,
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
      const result = await feature.action(dataUri, user.uid);
      
      setProcessedImageUrl(result.enhancedPhotoDataUri);

      if (result.enhancedPhotoDataUri) {
        await saveGeneratedImageClient(
            firestore,
            storage,
            user.uid,
            dataUri,
            result.enhancedPhotoDataUri,
            feature.name
        );
      }
      
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
              You don't have enough credits for this action. <Link href="/#pricing" className="underline font-bold">Upgrade your plan</Link> for more credits.
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
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border">
          <BeforeAfterSlider
            before={originalDataUri}
            after={processedImageUrl}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border">
          {originalDataUri && (
            <Image
              src={originalDataUri}
              alt="Original upload"
              fill
              className="object-contain"
            />
          )}
          <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Original
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border">
          <Image
            src={processedImageUrl}
            alt="Processed result"
            fill
            className="object-contain"
          />
           <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Generated
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
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
                        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border">
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
                        <div className="space-y-4 text-center p-8">
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                            <p className="text-lg text-muted-foreground font-semibold">Magic in progress...</p>
                            <p className="text-sm text-muted-foreground">Please wait while our AI enhances your image.</p>
                            <Progress value={progress} className="w-full max-w-sm mx-auto" />
                        </div>
                    )}
                    </div>
                )}
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Actions</h2>
                  {error && !isProcessing && (
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                  {!isProcessing && renderQuotaAlert()}

                  <div className="flex flex-col gap-3">
                      {!isProcessing && !processedImageUrl && (
                        <Button size="lg" onClick={handleProcessImage} disabled={!user || !originalFile || isCreditLoading || credits < feature.creditCost}>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate ({feature.creditCost} {feature.creditCost === 1 ? 'credit' : 'credits'})
                        </Button>
                      )}
                      
                      {processedImageUrl && (
                          <Button size="lg" asChild>
                              <a href={processedImageUrl} download={`magicpixa-${feature.name.toLowerCase().replace(/\s+/g, '-')}.png`}>
                                  <Download className="mr-2 h-4 w-4"/>
                                  Download Result
                              </a>
                          </Button>
                      )}

                      <Button size="lg" variant="outline" onClick={handleReset} disabled={isProcessing}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start Over
                      </Button>
                  </div>
                   <div className="text-center text-sm text-muted-foreground pt-2">
                        {isUserLoading || isCreditLoading ? (
                            <Skeleton className="h-4 w-32 mx-auto" />
                        ) : user ? (
                            <p>You have {credits} credits left.</p>
                        ) : (
                            <p>
                                Please{' '}
                                <Link href="/login" className="underline font-semibold hover:text-primary">
                                    sign in
                                </Link>{' '}
                                to start creating.
                            </p>
                        )}
                    </div>
              </CardContent>
          </Card>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              {feature.description} This costs {feature.creditCost} credit(s).
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
