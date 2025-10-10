
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { features } from '@/lib/features';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BeforeAfterSlider } from '@/components/before-after-slider';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, User, Loader2, Download, RefreshCw, Wand2, Lightbulb, Sparkles, CheckCircle2, Palette, Edit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCredit } from '@/hooks/use-credit';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeImageAction, colorCorrectAction, restorePhotoAction } from '@/app/actions';
import { cn } from '@/lib/utils';

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ProcessingState = ({ progress, processingText }: { progress: number; processingText: string }) => (
    <div className="text-center p-8 rounded-3xl border-2 border-dashed border-primary/50 h-full bg-primary/10 animate-pulse flex flex-col justify-center">
        <h3 className="font-semibold text-lg text-primary">{processingText}</h3>
        <p className="text-primary/80 text-sm mt-1">Applying AI magic, please wait...</p>
        <Progress value={progress} className="w-full max-w-sm mx-auto mt-4" />
    </div>
);

export default function EnhancePage() {
  const feature = features.find((f) => f.name === 'Photo Enhancement');
  const { toast } = useToast();
  const { user, loading: isUserLoading } = useUser();
  const { credits, isLoading: isCreditLoading, consumeCredits } = useCredit();
  const firestore = useFirestore();
  const app = useFirebaseApp();

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState('Magicpixa is working...');


  useEffect(() => {
    if (originalDataUri && !processedImageUrl) {
      setImageAnalysis("Analyzing image...");
      analyzeImageAction(originalDataUri)
        .then(result => setImageAnalysis(result.analysis))
        .catch(() => setImageAnalysis("Perfect upload! Let’s choose an enhancement."));
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

  const handleProcessImage = async (mode: 'color' | 'restore') => {
    if (!originalFile || !user || !originalDataUri || !firestore || !app) return;
    
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
    setProcessingText(mode === 'color' ? 'Applying color correction...' : 'Restoring photo quality...');

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
      const action = mode === 'color' ? colorCorrectAction : restorePhotoAction;
      const result = await action(originalDataUri, user.uid);
      
      if (result.enhancedPhotoDataUri) {
          setProcessedImageUrl(result.enhancedPhotoDataUri);
          await saveAIOutput(
              app,
              firestore,
              mode === 'color' ? 'Color Correction' : 'Photo Restoration',
              result.enhancedPhotoDataUri,
              'image/jpeg',
              user.uid
          );
          await consumeCredits(feature.creditCost);
      } else {
          throw new Error('AI generation failed to return an image.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Processing failed. Please try again or upload a clearer image.';
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
    
    if (feature.isComingSoon) {
      return (
        <Alert className="mt-4 rounded-2xl">
          <Clock className="h-4 w-4" />
          <AlertTitle>Coming Soon!</AlertTitle>
          <AlertDescription>
            This feature is currently under development. Stay tuned!
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  const renderResultView = () => {
    if (!originalDataUri) return <FileUploader onFileSelect={handleFileSelect} />;
    
    if (processedImageUrl) {
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
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border">
          <Image
            src={originalDataUri}
            alt="Original upload"
            fill
            className="object-contain"
          />
      </div>
    );
  }

  const isAwaitingUpload = !originalDataUri;
  const isResultReady = !!processedImageUrl;
  const isReadyToProcess = !isAwaitingUpload && !isProcessing && !isResultReady;

  return (
    <div className="space-y-8 animate-fade-in-up">
        <section>
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                        <feature.icon className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                </div>
                <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credit(s) per use.</p>
            </div>
        </section>

        <div className="h-px w-full bg-border" />

        <section>
            <h2 className="text-2xl font-semibold mb-4">Try It Yourself</h2>
            
            <div className="mb-8">
              {renderResultView()}
            </div>
            
            {isResultReady ? (
                <div className="flex justify-center">
                    <Card className="w-full max-w-md rounded-3xl">
                        <CardHeader className="text-center">
                            <CardTitle>Result Ready</CardTitle>
                            <CardDescription>Your image has been enhanced. Download it or create another one.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                    <RefreshCw className="mr-2 h-5 w-5" />
                                    Enhance Another
                                </Button>
                                <Button size="lg" asChild className="h-12 w-full rounded-2xl">
                                    <a href={processedImageUrl!} download={`magicpixa-enhanced.png`}>
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Image
                                    </a>
                                 </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="min-h-[200px] flex flex-col justify-center">
                        {isAwaitingUpload && (
                            <div className="text-center p-8 rounded-3xl border-2 border-dashed border-border h-full bg-card/50 flex flex-col justify-center">
                                <Lightbulb className="mx-auto h-10 w-10 text-yellow-400 mb-4" />
                                <h3 className="font-semibold text-lg text-foreground">Upload an image to get started.</h3>
                                <p className="text-muted-foreground text-sm mt-1">Supported formats: JPG, PNG, WEBP (max 20MB).</p>
                            </div>
                        )}
                        {isProcessing && <ProcessingState progress={progress} processingText={processingText} />}
                        {isReadyToProcess && (
                            <div className="p-6 rounded-3xl bg-card/50 h-full flex flex-col justify-center animate-fade-in-up">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <CheckCircle2 className="h-10 w-10 text-green-500"/>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-foreground">{originalFile?.name}</p>
                                        <p className="text-sm text-muted-foreground">{(originalFile?.size || 0 / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {imageAnalysis && (
                                     <div className="mt-4 p-4 rounded-2xl bg-primary/10 text-primary-foreground">
                                        <p className="text-sm font-medium text-primary flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-yellow-400" />
                                            {imageAnalysis}
                                        </p>
                                     </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Card className="rounded-3xl h-full sticky top-24">
                        <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Choose Enhancement</h2>
                                {error && !isProcessing && (
                                    <Alert variant="destructive" className="rounded-2xl">
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                {renderQuotaAlert()}
                            </div>
                            <div className="flex flex-col gap-3">
                                 <Button 
                                    size="lg" 
                                    className="rounded-2xl h-12" 
                                    onClick={() => handleProcessImage('color')} 
                                    disabled={!user || !originalFile || isProcessing || isCreditLoading || credits < feature.creditCost || imageAnalysis === "Analyzing image..."}
                                >
                                    <Palette className="mr-2 h-5 w-5" />
                                    Color Correct
                                </Button>
                                 <Button 
                                    size="lg" 
                                    className="rounded-2xl h-12" 
                                    onClick={() => handleProcessImage('restore')} 
                                    disabled={!user || !originalFile || isProcessing || isCreditLoading || credits < feature.creditCost || imageAnalysis === "Analyzing image..."}
                                >
                                    <Edit className="mr-2 h-5 w-5" />
                                    Restore Photo
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
        </section>
    </div>
  );
}
