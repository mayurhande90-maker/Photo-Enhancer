
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useCredit } from '@/hooks/use-credit';
import { useToast } from '@/hooks/use-toast';
import { recreateChildhoodAction } from '@/app/actions';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Download, RefreshCw, Users, Lightbulb, Loader2, Bot, Clock, Image as ImageIcon, FileText, MapPin } from 'lucide-react';
import { features } from '@/lib/features';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { BeforeAfterSlider } from '@/components/before-after-slider';

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
            <li>Use a clear photo of the place, or a short 1-2 line memory.</li>
            <li>For photos, landscape or front-facing building shots work best.</li>
            <li>Combining a photo with a short description gives the best results.</li>
        </ul>
    </div>
);

const placeTypes = ["Home", "Street", "School", "Playground", "Shop", "Park"];
const styles = ["Photo-realistic", "Cinematic", "Modernized"];
const intensities: ("mild" | "normal" | "high")[] = ["mild", "normal", "high"];

export default function RecreateChildhoodPage() {
    const feature = features.find(f => f.name === 'Recreate Childhood Place')!;
    const { toast } = useToast();
    const { user, loading: isUserLoading } = useUser();
    const { credits, isLoading: isCreditLoading, consumeCredits } = useCredit();
    const firestore = useFirestore();

    const [inputType, setInputType] = useState<"photo" | "text" | "photo+text">('photo');
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
    const [memoryText, setMemoryText] = useState('');
    
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const [placeType, setPlaceType] = useState(placeTypes[0]);
    const [style, setStyle] = useState(styles[0]);
    const [intensity, setIntensity] = useState<"mild" | "normal" | "high">(intensities[1]);
    const [consentChecked, setConsentChecked] = useState(false);
    
    const [processingText, setProcessingText] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
          setProgress(0);
          setProcessingText(`Recreating your childhood place today... this may take a moment!`);
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
    }, [isProcessing]);

    useEffect(() => {
        if(processedImageUrl){
            setProgress(100);
            setIsProcessing(false);
        }
    }, [processedImageUrl]);

    const handleFileSelect = (file: File) => {
        setOriginalFile(file);
        fileToDataUri(file).then(dataUri => {
            setOriginalDataUri(dataUri);
        });
        if (inputType === 'text') setInputType('photo+text');
    };
    
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemoryText(e.target.value);
        if (inputType === 'photo') setInputType('photo+text');
    }

    const handleProcessImage = async () => {
        if (!user || !firestore || !consentChecked) {
            toast({ title: 'Consent Required', description: 'Please agree to the terms to proceed.', variant: 'destructive' });
            return;
        }

        const currentInputType = !originalFile && memoryText ? 'text' : (originalFile && !memoryText ? 'photo' : 'photo+text');

        if (currentInputType === 'text' && !memoryText) {
            toast({ title: 'Missing Input', description: 'Please enter a memory description.', variant: 'destructive' });
            return;
        }
        if (currentInputType === 'photo' && !originalFile) {
            toast({ title: 'Missing Input', description: 'Please upload a photo.', variant: 'destructive' });
            return;
        }
        if (currentInputType === 'photo+text' && (!originalFile || !memoryText)) {
             toast({ title: 'Missing Input', description: 'Please upload a photo and enter a memory description.', variant: 'destructive' });
            return;
        }

        if (!isCreditLoading && credits < feature.creditCost) {
            toast({ title: 'Not Enough Credits', description: `You need ${feature.creditCost} credits.`, variant: 'destructive' });
            return;
        }

        setIsProcessing(true);
        setError(null);
        setProcessedImageUrl(null);

        try {
            const result = await recreateChildhoodAction(
                originalDataUri || '',
                memoryText,
                currentInputType,
                placeType,
                style,
                intensity,
                user.uid
            );
            
            if (result.modernizedPhotoDataUri) {
                setProcessedImageUrl(result.modernizedPhotoDataUri);
                await saveAIOutput(feature.name, result.modernizedPhotoDataUri, 'image/jpeg', user.uid);
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
        setMemoryText('');
        setProcessedImageUrl(null);
        setError(null);
        setIsProcessing(false);
        setProgress(0);
        setInputType('photo');
    };

    const isReadyToGenerate = useMemo(() => {
        const hasInput = (inputType === 'photo' && !!originalFile) || (inputType === 'text' && !!memoryText) || (inputType === 'photo+text' && !!originalFile && !!memoryText);
        return hasInput && !!user && !isProcessing && !isCreditLoading && consentChecked;
    }, [inputType, originalFile, memoryText, user, isProcessing, isCreditLoading, consentChecked]);
    
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
                        You need {feature.creditCost} credits. <Link href="/#pricing" className="underline font-bold">Upgrade your plan</Link>.
                    </AlertDescription>
                </Alert>
            );
        }
        return null;
    };
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            <section>
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                            <feature.icon className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                    </div>
                    <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credits.</p>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section>
                <h2 className="text-2xl font-semibold mb-4">Recreate Your Memory</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                            
                            {isResultReady && originalDataUri && (
                                <BeforeAfterSlider
                                    before={originalDataUri}
                                    after={processedImageUrl}
                                />
                            )}
                            
                            {!isResultReady && !originalDataUri && (
                                <FileUploader onFileSelect={handleFileSelect} />
                            )}

                             {!isResultReady && originalDataUri && (
                                <Image 
                                    src={originalDataUri}
                                    alt="Original upload"
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
                        {!isResultReady && <TipsSection />}
                    </div>
                   
                     <div>
                        {!isResultReady ? (
                             <Card className="rounded-3xl h-full sticky top-24">
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Upload a photo and/or describe the place you remember.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    
                                    <div className="space-y-2">
                                        <Label>Input</Label>
                                        <Input
                                            placeholder='e.g. "My childhood home, narrow lane, banyan tree, 1998"'
                                            value={memoryText}
                                            onChange={handleTextChange}
                                            disabled={isProcessing}
                                        />
                                        <p className="text-xs text-muted-foreground">You can use a photo, a description, or both for the best results.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Place Type</Label>
                                        <RadioGroup value={placeType} onValueChange={setPlaceType} className="flex flex-wrap gap-2">
                                            {placeTypes.map(item => (
                                                <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", placeType === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={item} className="sr-only" />
                                                    {item}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label>Style</Label>
                                        <RadioGroup value={style} onValueChange={setStyle} className="flex flex-wrap gap-2">
                                            {styles.map(item => (
                                                <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", style === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={item} className="sr-only" />
                                                    {item}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                     <div className="space-y-3">
                                        <Label>Modernization Intensity</Label>
                                        <RadioGroup value={intensity} onValueChange={(v) => setIntensity(v as any)} className="flex flex-wrap gap-2">
                                            {intensities.map(item => (
                                                <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", intensity === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={item} className="sr-only" />
                                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3 pt-2">
                                        <Checkbox id="consent" checked={consentChecked} onCheckedChange={(checked) => setConsentChecked(checked as boolean)} className="mt-1" disabled={isProcessing}/>
                                        <Label htmlFor="consent" className="text-xs font-normal text-muted-foreground">
                                           I own this photo / have permission. I consent to using location descriptors and accept generated results are for entertainment.
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
                                    <CardTitle>Scene Recreated!</CardTitle>
                                    <CardDescription>Download your image or start over.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                            <RefreshCw className="mr-2 h-5 w-5" />
                                            Generate Another
                                        </Button>
                                        <Button size="lg" asChild className="h-12 w-full rounded-2xl" disabled={!processedImageUrl}>
                                            <a href={processedImageUrl!} download={`magicpixa-recreated-place.png`}>
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
