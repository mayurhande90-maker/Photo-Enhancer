'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useCredit } from '@/hooks/use-credit';
import { useToast } from '@/hooks/use-toast';
import { aiFutureSelfAction, analyzeImageAction } from '@/app/actions';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Download, RefreshCw, Users, Lightbulb, CheckCircle2, Sparkles, Loader2, Bot, Clock } from 'lucide-react';
import { features } from '@/lib/features';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TipsSection = () => (
    <div className="text-left p-4 mt-4 rounded-2xl border bg-card/50">
        <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-base text-foreground">Tips for Best Results</h3>
        </div>
        <ul className="text-muted-foreground text-xs mt-2 space-y-1 list-disc list-inside">
            <li>Use a clear, front-facing mid-shot (chest-up).</li>
            <li>Avoid sunglasses, hats, or heavy shadows.</li>
            <li>High-resolution photos work best (1024px+).</li>
        </ul>
    </div>
);

const ageGaps = [10, 20, 30, 40];


export default function AIFutureSelfPage() {
    const feature = features.find(f => f.name === 'AI Future Self')!;
    const { toast } = useToast();
    const { user, loading: isUserLoading } = useUser();
    const { credits, isLoading: isCreditLoading, consumeCredits } = useCredit();
    const firestore = useFirestore();

    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);

    const [selectedAgeGap, setSelectedAgeGap] = useState(ageGaps[1]);
    const [consentChecked, setConsentChecked] = useState(false);
    const [processingText, setProcessingText] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
          setProgress(0);
          setProcessingText(`Aging you by ${selectedAgeGap} years... this is complex stuff, please wait!`);
          interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 95) {
                clearInterval(interval);
                return 95;
              }
              return prev + 5;
            });
          }, 800);
        }
        
        return () => {
            if(interval) clearInterval(interval);
        };
    }, [isProcessing, selectedAgeGap]);

    useEffect(() => {
        if(processedImageUrl){
            setProgress(100);
            setIsProcessing(false);
        }
    }, [processedImageUrl]);

    useEffect(() => {
        if (originalDataUri && !processedImageUrl) {
            setImageAnalysis("Analyzing image...");
            analyzeImageAction(originalDataUri)
                .then(result => setImageAnalysis(result.analysis))
                .catch(() => setImageAnalysis("Perfect upload! Let’s see what Magicpixa can do."));
        }
    }, [originalDataUri, processedImageUrl]);


    const handleFileSelect = (file: File) => {
        handleReset();
        setOriginalFile(file);
        fileToDataUri(file).then(dataUri => {
            setOriginalDataUri(dataUri);
        });
    };

    const handleProcessImage = async () => {
        if (!originalFile || !user || !originalDataUri || !firestore || !selectedAgeGap || !consentChecked) {
             toast({ title: 'Missing Information', description: `Please upload an image, select an age gap, and give consent.`, variant: 'destructive' });
            return;
        }

        if (!isCreditLoading && credits < feature.creditCost) {
            toast({ title: 'Not Enough Credits', description: `You need ${feature.creditCost} credits for this.`, variant: 'destructive' });
            return;
        }

        setIsProcessing(true);
        setError(null);
        setProcessedImageUrl(null);

        try {
            const result = await aiFutureSelfAction(originalDataUri, selectedAgeGap, user.uid);
            
            if (result.agedPhotoDataUri) {
                setProcessedImageUrl(result.agedPhotoDataUri);
                await saveAIOutput(firestore, feature.name, result.agedPhotoDataUri, 'image/jpeg', user.uid);
                await consumeCredits(feature.creditCost);
            } else {
                throw new Error('AI generation failed to return an image.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            toast({ title: 'Processing Error', description: errorMessage, variant: 'destructive' });
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
        setImageAnalysis(null);
    };

    const isReadyToGenerate = useMemo(() => {
        return !!originalFile && !!selectedAgeGap && consentChecked && !!user && !isProcessing && !isCreditLoading && !!imageAnalysis && imageAnalysis !== "Analyzing image...";
    }, [originalFile, selectedAgeGap, consentChecked, user, isProcessing, isCreditLoading, imageAnalysis]);
    
    const isResultReady = !!processedImageUrl && !isProcessing;

    const renderQuotaAlert = () => {
        if (isUserLoading || isCreditLoading) return null;

        if (!user) {
            return (
                <Alert variant="destructive" className="mt-4 rounded-2xl">
                    <Users className="h-4 w-4" />
                    <AlertTitle>Sign Up to Continue</AlertTitle>
                    <AlertDescription>
                        Please <Link href="/signup" className="underline font-bold">create an account</Link> or <Link href="/login" className="underline font-bold">log in</Link> to use this feature.
                    </AlertDescription>
                </Alert>
            );
        }

        if (user && credits < feature.creditCost) {
            return (
                <Alert variant="destructive" className="mt-4 rounded-2xl">
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Not Enough Credits</AlertTitle>
                    <AlertDescription>
                        You need {feature.creditCost} credits for this action. <Link href="/#pricing" className="underline font-bold">Upgrade your plan</Link> for more.
                    </AlertDescription>
                </Alert>
            );
        }
        return null;
    };
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            <section>
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                            <feature.icon className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                    </div>
                    <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credits.</p>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section>
                <h2 className="text-2xl font-semibold mb-4">See Your Future Self</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                            {!originalDataUri && !isResultReady && (
                                <FileUploader onFileSelect={handleFileSelect} />
                            )}
                            
                            {(originalDataUri || isResultReady) && (
                                <Image 
                                    src={processedImageUrl || originalDataUri!} 
                                    alt={processedImageUrl ? "Generated future self" : "Original upload"} 
                                    fill 
                                    className={cn("object-contain transition-all duration-500", isProcessing && "opacity-50 blur-sm")} 
                                />
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
                            <div className="p-4 rounded-2xl bg-primary/10 text-primary-foreground max-w-md mx-auto w-full">
                                <p className="text-sm font-medium text-primary flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-yellow-400" />
                                    {imageAnalysis}
                                </p>
                            </div>
                        )}
                        {!isResultReady && <TipsSection />}
                    </div>
                   
                     <div>
                        {!isResultReady ? (
                             <Card className="rounded-3xl h-full sticky top-24">
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Choose how many years into the future you want to see.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Age Gap</Label>
                                        <RadioGroup value={String(selectedAgeGap)} onValueChange={(val) => setSelectedAgeGap(Number(val))} className="flex flex-wrap gap-2">
                                            {ageGaps.map(gap => (
                                                <Label key={gap} className={cn("px-4 py-2 border rounded-full text-sm cursor-pointer transition-colors", String(selectedAgeGap) === String(gap) ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={String(gap)} className="sr-only" />
                                                    + {gap} years
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3 pt-2">
                                        <Checkbox id="consent" checked={consentChecked} onCheckedChange={(checked) => setConsentChecked(checked as boolean)} className="mt-1" disabled={isProcessing || !originalDataUri}/>
                                        <Label htmlFor="consent" className="text-xs font-normal text-muted-foreground">
                                            I confirm I own or have permission to use this photo. I agree this generated image will be used only for entertainment and not to deceive, impersonate, or defame anyone.
                                        </Label>
                                    </div>
                                    {renderQuotaAlert()}
                                    <Button size="lg" className="rounded-2xl h-12 w-full" onClick={handleProcessImage} disabled={!isReadyToGenerate}>
                                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                                        {isProcessing ? 'Generating...' : `Generate for ${feature.creditCost} Credits`}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                             <Card className="w-full rounded-3xl">
                                <CardHeader className="text-center">
                                    <CardTitle>Your Future Self is Ready</CardTitle>
                                    <CardDescription>Download your image or start over.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                            <RefreshCw className="mr-2 h-5 w-5" />
                                            Generate Another
                                        </Button>
                                        <Button size="lg" asChild className="h-12 w-full rounded-2xl" disabled={!processedImageUrl}>
                                            <a href={processedImageUrl!} download={`magicpixa-future-self-${Date.now()}.png`}>
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
