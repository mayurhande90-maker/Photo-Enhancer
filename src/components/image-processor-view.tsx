
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Feature } from '@/lib/types';
import { features } from '@/lib/features';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BeforeAfterSlider } from './before-after-slider';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Clock, User, Loader2, Download, RefreshCw, Wand2, Lightbulb, FileImage, Sparkles, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCredit } from '@/hooks/use-credit';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { saveGeneratedImageClient } from '@/firebase/images';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeImageAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { PlaceHolderImages, PlaceHolderImageSamples } from '@/lib/placeholder-images';

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const BeforeUploadState = () => {
    return (
        <div className="text-center p-8 rounded-3xl border-2 border-dashed border-border h-full bg-card/50 flex flex-col justify-center">
            <Lightbulb className="mx-auto h-10 w-10 text-yellow-400 mb-4" />
            <h3 className="font-semibold text-lg text-foreground">Tip: Upload a clear, front-facing photo for best results.</h3>
            <p className="text-muted-foreground text-sm mt-1">Supported formats: JPG, PNG, WEBP (max 20MB).</p>
        </div>
    )
}

const AfterUploadState = ({ file, analysis }: { file: File; analysis: string; }) => (
    <Card className="h-full rounded-3xl animate-fade-in-up">
        <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <CheckCircle2 className="h-10 w-10 text-green-500"/>
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
            {analysis && (
                 <div className="mt-4 p-4 rounded-2xl bg-primary/10 text-primary-foreground">
                    <p className="text-sm font-medium text-primary flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                        {analysis}
                    </p>
                 </div>
            )}
        </CardContent>
    </Card>
);

const ProcessingState = ({ progress, featureName }: { progress: number; featureName: string; }) => (
    <div className="text-center p-8 rounded-3xl border-2 border-dashed border-primary/50 h-full bg-primary/10 animate-pulse flex flex-col justify-center">
        <h3 className="font-semibold text-lg text-primary">✨ Magicpixa is working on your image…</h3>
        <p className="text-primary/80 text-sm mt-1">Enhancing colors, fixing lighting, and adding clarity.</p>
        <Progress value={progress} className="w-full max-w-sm mx-auto mt-4" />
    </div>
);


export function ImageProcessorView({ featureName }: { featureName: string }) {
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
  const [imageAnalysis, setImageAnalysis] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (originalDataUri && !processedImageUrl) {
      setImageAnalysis("Analyzing image...");
      analyzeImageAction(originalDataUri)
        .then(result => setImageAnalysis(result.analysis))
        .catch(() => setImageAnalysis("Perfect upload! Let’s see what Magicpixa can do."));
    }
  }, [originalDataUri, processedImageUrl]);
  
  if (!feature) {
    return <div>Feature not found.</div>;
  }

  const handleFileSelect = (file: File) => {
    handleReset();
    setOriginalFile(file);
    fileToDataUri(file).then(setOriginalDataUri);
    
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
         try {
            await saveGeneratedImageClient(
                firestore,
                storage,
                user.uid,
                dataUri, // original image
                result.enhancedPhotoDataUri,
                feature.name
            );
             toast({
                title: '✅ Image saved to "My Creations"',
             });
        } catch (saveError: any) {
             console.error("Failed to save image:", saveError);
             toast({
                title: '⚠️ Couldn’t save image automatically.',
                description: 'You can still download it manually.',
                variant: 'destructive',
            });
        }
      } else {
         throw new Error('AI generation failed to return an image.');
      }
      
      await consumeCredits(feature.creditCost);

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
    setImageAnalysis("");
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
    if (!originalDataUri) return null;

    if (processedImageUrl && feature.showBeforeAfterSlider) {
      return (
        <div className="relative">
             <div className="relative aspect-video w-full overflow-hidden rounded-3xl border">
                <BeforeAfterSlider
                    before={originalDataUri}
                    after={processedImageUrl}
                />
            </div>
        </div>
      );
    }
    
    return (
      <div>
        <div className={cn("grid grid-cols-1 gap-4", processedImageUrl && "md:grid-cols-2")}>
          <div className={cn(!processedImageUrl && "max-w-xl mx-auto w-full")}>
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
          </div>
          {processedImageUrl && (
            <div>
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
          )}
        </div>
      </div>
    );
  }

  const isAwaitingUpload = !originalDataUri;
  const isResultReady = !!processedImageUrl;

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
        </section>

        <div className="h-px w-full bg-border" />

        {/* Section B: Action/Upload */}
        <section>
             <h2 className="text-2xl font-semibold mb-4">Try It Yourself</h2>
             {isUserLoading && !user ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : isAwaitingUpload ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FileUploader onFileSelect={handleFileSelect} />
                  <BeforeUploadState />
                </div>
             ) : (
                renderResultView()
             )}
        </section>
        
        {/* Section C: Post-Upload, Pre-Result Feedback and Actions */}
        {!isAwaitingUpload && !isResultReady && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mt-8">
            <div className="min-h-[200px]">
              {isProcessing ? (
                <ProcessingState progress={progress} featureName={feature.name} />
              ) : (
                originalFile && <AfterUploadState file={originalFile} analysis={imageAnalysis} />
              )}
            </div>
            
            <Card className="rounded-3xl sticky top-24 h-full">
              <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Actions</h2>
                  {error && !isProcessing && (
                    <Alert variant="destructive" className="rounded-2xl">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {renderQuotaAlert()}
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" className="rounded-2xl h-12" onClick={handleProcessImage} disabled={!user || !originalFile || isProcessing || isCreditLoading || credits < feature.creditCost || imageAnalysis === "Analyzing image..."}>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate
                  </Button>
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section D: Final Actions Post-Result */}
        {isResultReady && (
          <div className="mt-8 flex justify-center">
            <Card className="w-full max-w-md rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-2xl"
                    onClick={handleReset}
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generate Another
                  </Button>
                  <Button
                    size="lg"
                    asChild
                    className="h-12 flex-1 rounded-2xl"
                  >
                    <a
                      href={processedImageUrl!}
                      download={`magicpixa-${feature.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Image
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}
