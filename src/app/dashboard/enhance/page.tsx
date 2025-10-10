'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { features } from '@/lib/features';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, User, Loader2, Download, RefreshCw, Wand2, Lightbulb, Sparkles, Bot } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCredit } from '@/hooks/use-credit';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeImageAction, colorCorrectAction, restorePhotoAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  const [processingText, setProcessingText] = useState('');
  
  const [selectedMode, setSelectedMode] = useState<'color' | 'restore'>('color');
  const [showOriginal, setShowOriginal] = useState(false);


  useEffect(() => {
    if (originalDataUri && !processedImageUrl) {
      setImageAnalysis("Analyzing image...");
      analyzeImageAction(originalDataUri)
        .then(result => setImageAnalysis(result.analysis))
        .catch(() => setImageAnalysis("Perfect upload! Let’s see what Magicpixa can do."));
    }
  }, [originalDataUri, processedImageUrl]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setProgress(0);
      setProcessingText(selectedMode === 'color' ? 'Applying color correction...' : 'Restoring photo clarity...');
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, selectedMode]);

  useEffect(() => {
    if (processedImageUrl) {
      setProgress(100);
      setIsProcessing(false);
    }
  }, [processedImageUrl]);

  if (!feature) {
    return <div>Feature not found.</div>;
  }

  const handleFileSelect = (file: File) => {
    handleReset();
    setOriginalFile(file);
    fileToDataUri(file).then(setOriginalDataUri);
  };

  const handleProcessImage = async () => {
    if (!originalFile || !user || !firestore || !app) return;
    
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
    setShowOriginal(false);

    try {
        // First, upload the original image to get a URL
        const uploadedUrl = await saveAIOutput(app, firestore, "original-upload", originalFile, originalFile.type, user.uid);
        
        // Then, call the action with the URL
        const action = selectedMode === 'color' ? colorCorrectAction : restorePhotoAction;
        const result = await action(app, firestore, uploadedUrl, user.uid);
      
        if (result.enhancedPhotoDataUri) {
            setProcessedImageUrl(result.enhancedPhotoDataUri);
            await consumeCredits(feature.creditCost);
        } else {
            throw new Error('AI generation failed to return an image.');
        }
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
    setSelectedMode('color');
    setShowOriginal(false);
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
  
  const isReadyToGenerate = useMemo(() => {
    return !!originalFile && !!user && !isProcessing && !isCreditLoading && imageAnalysis !== "Analyzing image...";
  }, [originalFile, user, isProcessing, isCreditLoading, imageAnalysis]);
  
  const isResultReady = !!processedImageUrl && !isProcessing;
  const currentImageToShow = showOriginal ? originalDataUri : processedImageUrl;

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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                        {!originalDataUri && !isResultReady && (
                            <FileUploader onFileSelect={handleFileSelect} />
                        )}

                        {originalDataUri && !isResultReady && (
                            <Image src={originalDataUri} alt="Original upload" fill className="object-contain" />
                        )}
                        
                        {isResultReady && currentImageToShow && (
                            <Image src={currentImageToShow} alt={showOriginal ? "Original" : "Generated"} fill className="object-contain transition-all duration-300" />
                        )}

                        {isProcessing && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-sm p-4">
                                <Bot className="h-12 w-12 animate-pulse" />
                                <p className="mt-4 font-semibold text-lg text-center">{processingText}</p>
                                <Progress value={progress} className="w-4/5 max-w-sm mx-auto mt-2" />
                                <p className="text-sm mt-1">{progress}%</p>
                            </div>
                        )}
                    </div>
                    {imageAnalysis && !isResultReady && (
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary-foreground">
                            <p className="text-sm font-medium text-primary flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                                {imageAnalysis}
                            </p>
                        </div>
                    )}
                </div>
                   
                <div>
                    {!isResultReady ? (
                        <Card className="rounded-3xl h-full sticky top-24">
                             <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                                <CardDescription>Choose an enhancement mode for your photo.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <RadioGroup value={selectedMode} onValueChange={(v) => setSelectedMode(v as any)} className="grid grid-cols-2 gap-4" disabled={!originalFile || isProcessing}>
                                    <div>
                                        <RadioGroupItem value="color" id="color" className="peer sr-only" />
                                        <Label htmlFor="color" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            Color Correct
                                            <span className="text-xs text-muted-foreground mt-1 text-center">Balance colors and lighting</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="restore" id="restore" className="peer sr-only" />
                                        <Label htmlFor="restore" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            Restore Photo
                                            <span className="text-xs text-muted-foreground mt-1 text-center">Fix blur and enhance details</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {renderQuotaAlert()}

                                <Button size="lg" className="rounded-2xl h-12 w-full" onClick={handleProcessImage} disabled={!isReadyToGenerate}>
                                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                                    {isProcessing ? 'Generating...' : `Generate for ${feature.creditCost} Credit`}
                                </Button>
                                <div className="text-center text-sm text-muted-foreground">
                                    {isUserLoading || isCreditLoading ? (
                                        <Skeleton className="h-4 w-32 mx-auto" />
                                    ) : user ? (
                                        <p>You have {credits} credits left.</p>
                                    ) : (
                                        <p>
                                            <Link href="/login" className="underline font-semibold hover:text-primary">Sign in</Link> to start creating.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <Card className="w-full rounded-3xl">
                            <CardHeader className="text-center">
                                <CardTitle>Result Ready</CardTitle>
                                <CardDescription>Your image has been enhanced. Download it or start over.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <Label htmlFor="result-toggle" className={cn("font-medium", showOriginal && "text-muted-foreground")}>Generated</Label>
                                    <Switch id="result-toggle" checked={showOriginal} onCheckedChange={setShowOriginal} />
                                    <Label htmlFor="result-toggle" className={cn("font-medium", !showOriginal && "text-muted-foreground")}>Original</Label>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                        <RefreshCw className="mr-2 h-5 w-5" />
                                        Enhance Another
                                    </Button>
                                    <Button size="lg" asChild className="h-12 w-full rounded-2xl" disabled={!processedImageUrl}>
                                        <a href={processedImageUrl!} download={`magicpixa-enhanced.png`}>
                                            <Download className="mr-2 h-5 w-5" />
                                            Download Image
                                        </a>
                                     </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    </div>
  );
}
