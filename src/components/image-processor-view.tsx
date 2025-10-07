
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
import { Terminal, Clock, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCredit } from '@/hooks/use-credit';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/firebase';

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
  const { credits, resetTime, isLoading: isCreditLoading, consumeCredits } = useCredit();

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
    if (!originalFile) return;

    if (credits < feature.creditCost) {
        toast({
            title: 'Not Enough Credits',
            description: user 
                ? `You don't have enough credits for this. Your credits will reset in ${resetTime ? formatDistanceToNow(resetTime) : 'a month'}.`
                : 'You have used your one free credit. Please sign up for more.',
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
    }, 200);

    try {
      const dataUri = await fileToDataUri(originalFile);
      const result = await feature.action(dataUri);
      setProcessedImageUrl(result.enhancedPhotoDataUri);
      consumeCredits(feature.creditCost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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
  
  const renderQuotaExhaustedAlert = () => {
    if (isUserLoading || isCreditLoading || credits >= feature.creditCost) return null;

    const alertTitle = user ? "Monthly Quota Reached" : "Free Credit Used";
    const alertDescription = user ? (
        <>
            You have used all your free credits for this month. Your credits will reset in{' '}
            {resetTime ? formatDistanceToNow(resetTime) : 'about a month'}.
        </>
    ) : (
        <>
            You have used your single free credit. Please <Link href="/signup" className="underline font-bold">sign up</Link> to get more credits.
        </>
    );

    return (
      <Alert variant="destructive" className="mt-4">
        <Clock className="h-4 w-4" />
        <AlertTitle>{alertTitle}</AlertTitle>
        <AlertDescription>{alertDescription}</AlertDescription>
      </Alert>
    );
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
          {!originalFile && <FileUploader onFileSelect={handleFileSelect} />}

          {originalDataUri && (
            <div className="space-y-4">
              
              {!processedImageUrl && (
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
              
              {renderQuotaExhaustedAlert()}

              <div className="flex flex-wrap gap-2">
                {!isProcessing && !processedImageUrl && (
                  <Button onClick={handleProcessImage} disabled={isUserLoading || isCreditLoading || credits < feature.creditCost}>
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

                <Button variant="outline" onClick={handleReset}>
                  Try Another Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-sm text-muted-foreground">
        {isUserLoading ? (
            <p>Loading credit information...</p>
        ) : user ? (
            <p>You have {credits} credits left for this month.</p>
        ) : (
            <p>
                You have {credits} free image credit left.{' '}
                <Link href="/signup" className="underline">
                    Sign up
                </Link>{' '}
                to get 10 more.
            </p>
        )}
      </div>
    </div>
  );
}

    