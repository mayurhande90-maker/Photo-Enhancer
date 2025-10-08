
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
      toast({
          title: 'Image Generated!',
          description: 'Your creation has been saved to your gallery.',
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
          title: 'Processing Error',
          description: errorMessage,
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

    if (!user) {
      return (
        <Alert variant="destructive" className="mt-4 rounded-2xl">
          <User className="h-4 w-4" />
          <AlertTitle>Sign Up to Continue</AlertTitle>
          <AlertDescription>
              Please <Link href="/signup" className="underline font-bold">create an account</Link> or <Link href="/login" className="underline font-bold">log in</Link> to use this feature.
          </AlertDescription>
        </Alert>
      )
    }

    if (user && noCredits) {
      return (
         <Alert variant="destructive" className="mt-4 rounded-2xl">
          <Clock className="h-4 w-4" />
          <AlertTitle>Not Enough Credits</AlertTitle>
          <AlertDescription>
              You need {feature.creditCost} credits for this action. <Link href="/#pricing" className="underline font-bold">Upgrade your plan</Link> for more.
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
    <div className="space-y-8 animate-fade-in-up">
        {/* Section A: Feature Overview */}
        <section>
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                        <feature.icon className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                </div>
                <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credit(s).</p>
            </div>
            {/* You can add a before/after slider or carousel here */}
        </section>

        <div className="h-px w-full bg-border" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section B: Action/Upload */}
            <section className="lg:col-span-2">
                 <h2 className="text-2xl font-semibold mb-4">Try It Yourself</h2>
                 {!user && isUserLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !originalFile ? (
                    <FileUploader onFileSelect={handleFileSelect} />
                ) : (
                  <>
                    {isProcessing ? (
                        <div className="space-y-4 text-center p-8 rounded-3xl border-2 border-dashed">
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                            <p className="text-lg text-muted-foreground font-semibold">Magic in progress...</p>
                            <p className="text-sm text-muted-foreground">Please wait while our AI enhances your image.</p>
                            <Progress value={progress} className="w-full max-w-sm mx-auto" />
                        </div>
                    ) : (
                      renderResultView()
                    )}
                  </>
                )}
            </section>
            
            {/* Section C: Output & Tools */}
            <section>
                <Card className="rounded-3xl sticky top-24">
                  <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-semibold">Actions</h2>
                      {error && !isProcessing && (
                          <Alert variant="destructive" className="rounded-2xl">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        
                      {!isProcessing && renderQuotaAlert()}

                      <div className="flex flex-col gap-3">
                          {!isProcessing && !processedImageUrl && (
                            <Button size="lg" className="rounded-2xl h-12" onClick={handleProcessImage} disabled={!user || !originalFile || isCreditLoading || credits < feature.creditCost}>
                              <Wand2 className="mr-2 h-5 w-5" />
                              Generate
                            </Button>
                          )}
                          
                          {processedImageUrl && !isProcessing && (
                              <Button size="lg" asChild className="rounded-2xl h-12">
                                  <a href={processedImageUrl} download={`magicpixa-${feature.name.toLowerCase().replace(/\s+/g, '-')}.png`}>
                                      <Download className="mr-2 h-5 w-5"/>
                                      Download Result
                                  </a>
                              </Button>
                          )}

                          <Button size="lg" variant="outline" className="rounded-2xl h-12" onClick={handleReset} disabled={isProcessing}>
                            <RefreshCw className="mr-2 h-5 w-5" />
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
                                    <Link href="/login" className="underline font-semibold hover:text-primary">
                                        Sign in
                                    </Link>{' '}
                                    to start creating.
                                </p>
                            )}
                        </div>
                  </CardContent>
              </Card>
            </section>
        </div>
    </div>
  );
}
