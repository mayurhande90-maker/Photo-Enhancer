
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
import { Terminal, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useDailyQuota } from '@/hooks/use-daily-quota';
import { formatDistanceToNow } from 'date-fns';

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
  const { credits, resetTime, isLoading: isQuotaLoading, consumeCredits } = useDailyQuota();

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
    if (!originalFile) return;

    if (credits < feature.creditCost) {
        toast({
            title: 'Daily Quota Exhausted',
            description: `You don't have enough credits for this feature. Your credits will reset in ${formatDistanceToNow(resetTime!)}.`,
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
      consumeCredits(feature.creditCost);
      const dataUri = await fileToDataUri(originalFile);
      const result = await feature.action(dataUri);
      setProcessedImageUrl(result.enhancedPhotoDataUri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      // refund credits if AI call fails
      consumeCredits(-feature.creditCost);
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
  
  const renderQuotaExhaustedAlert = () => {
    if (isQuotaLoading || credits >= feature.creditCost) return null;

    return (
      <Alert variant="destructive" className="mt-4">
        <Clock className="h-4 w-4" />
        <AlertTitle>Daily Quota Reached</AlertTitle>
        <AlertDescription>
          You have used all your free credits for today. Your credits will reset in {' '}
          {resetTime ? formatDistanceToNow(resetTime) : '24 hours'}.
        </AlertDescription>
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
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold">Original Image</h3>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image
              src={originalDataUri}
              alt="Original upload"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold">Magic Image</h3>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image
              src={processedImageUrl}
              alt="Processed result"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    );
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
              
              {renderQuotaExhaustedAlert()}

              <div className="flex flex-wrap gap-2">
                {!isLoading && !processedImageUrl && (
                  <Button onClick={handleProcessImage} disabled={isQuotaLoading || credits < feature.creditCost}>
                    Process Image ({feature.creditCost} credit)
                  </Button>
                )}
                
                {processedImageUrl && (
                    <Button asChild>
                        <a href={processedImageUrl} download={`magicpixa-${feature.name.toLowerCase().replace(' ','-')}.png`}>
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
    </div>
  );
}
