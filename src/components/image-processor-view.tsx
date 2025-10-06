'use client';

import { useState } from 'react';
import type { Feature } from '@/lib/types';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BeforeAfterSlider } from './before-after-slider';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImageProcessorViewProps {
  feature: Feature;
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageProcessorView({ feature }: ImageProcessorViewProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (file: File) => {
    setOriginalFile(file);
    fileToDataUri(file).then(setOriginalDataUri);
    setProcessedImageUrl(null);
    setError(null);
  };

  const handleProcessImage = async () => {
    if (!originalFile) return;

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
      const result = await feature.action(dataUri);
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
                  <Button onClick={handleProcessImage}>
                    Process Image ({feature.creditCost} credit)
                  </Button>
                )}
                
                {processedImageUrl && (
                    <Button asChild>
                        <a href={processedImageUrl} download={`photocraft-${feature.name.toLowerCase().replace(' ','-')}.png`}>
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
