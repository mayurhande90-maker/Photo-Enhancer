
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useCredit } from '@/hooks/use-credit';
import { useToast } from '@/hooks/use-toast';
import { magicInteriorAction, analyzeImageAction } from '@/app/actions';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wand2, Download, RefreshCw, Users, Lightbulb, CheckCircle2, Sparkles, Loader2, Bot, Clock, Home, Sofa, Palette, Sun } from 'lucide-react';
import { features } from '@/lib/features';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

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
            <li>Upload a clear, front-facing or wide-angle shot of your room.</li>
            <li>Make sure the room is well-lit.</li>
            <li>Structural elements like walls, windows, and doors will NOT be changed.</li>
        </ul>
    </div>
);

const roomTypes = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Dining Room", "Balcony", "Office"];
const interiorStyles = [
  "Japanese", "Italian", "American", "Modern", "Futuristic", "Mid-Century Modern", "Coastal"
];
const colorPalettes = ["Neutral", "Warm", "Cool"];
const lightingMoods = ["Bright Daylight", "Warm Evening", "Dramatic Spotlight"];


export default function MagicInteriorPage() {
    const feature = features.find(f => f.name === 'Magic Interior')!;
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

    const [roomType, setRoomType] = useState(roomTypes[0]);
    const [styleSelected, setStyleSelected] = useState(interiorStyles[0]);
    const [colorPalette, setColorPalette] = useState(colorPalettes[0]);
    const [lightingMood, setLightingMood] = useState(lightingMoods[0]);
    const [consentChecked, setConsentChecked] = useState(false);
    
    const [processingText, setProcessingText] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
          setProgress(0);
          setProcessingText(`Redesigning your ${roomType.toLowerCase()}... this is complex, please wait!`);
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
    }, [isProcessing, roomType]);

    useEffect(() => {
        if(processedImageUrl){
            setProgress(100);
            setIsProcessing(false);
        }
    }, [processedImageUrl]);

    useEffect(() => {
        if (originalDataUri && !processedImageUrl) {
            setImageAnalysis("Analyzing room...");
            analyzeImageAction(originalDataUri)
                .then(result => setImageAnalysis(result.analysis))
                .catch(() => setImageAnalysis("Great photo! Ready to redesign."));
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
        if (!originalFile || !user || !originalDataUri || !firestore || !consentChecked) {
            toast({ title: 'Missing Information', description: 'Please upload a photo and give consent.', variant: 'destructive' });
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
            const result = await magicInteriorAction(
                originalDataUri,
                roomType,
                styleSelected,
                { colorPalette, lightingMood },
                user.uid
            );
            
            if (result.redesignedPhotoDataUri) {
                setProcessedImageUrl(result.redesignedPhotoDataUri);
                await saveAIOutput(feature.name, result.redesignedPhotoDataUri, 'image/jpeg', user.uid);
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
        return !!originalFile && !!user && !isProcessing && !isCreditLoading && consentChecked && imageAnalysis !== "Analyzing room...";
    }, [originalFile, user, isProcessing, isCreditLoading, consentChecked, imageAnalysis]);
    
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
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-blue-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 text-white">
                            <feature.icon className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                    </div>
                    <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credits.</p>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section>
                <h2 className="text-2xl font-semibold mb-4">Redesign Your Space</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col gap-4">
                         <div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                            {isResultReady ? (
                                <Image 
                                    src={processedImageUrl!}
                                    alt="Generated Interior Design"
                                    fill 
                                    className="object-contain" 
                                />
                            ) : (
                                originalDataUri ? (
                                    <Image 
                                        src={originalDataUri}
                                        alt="Original upload"
                                        fill 
                                        className={cn("object-contain transition-all duration-500", isProcessing && "opacity-50 blur-sm")} 
                                    />
                                ) : (
                                     <FileUploader onFileSelect={handleFileSelect} />
                                )
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
                            <div className="p-4 rounded-2xl bg-primary/10 text-primary-foreground max-w-2xl mx-auto w-full">
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
                                    <CardDescription>Choose your room type and desired style.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    
                                     <div className="space-y-3">
                                        <Label>Room Type</Label>
                                        <RadioGroup value={roomType} onValueChange={setRoomType} className="flex flex-wrap gap-2">
                                            {roomTypes.map(item => (
                                                <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", roomType === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={item} className="sr-only" />
                                                    {item}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Style</Label>
                                         <RadioGroup value={styleSelected} onValueChange={setStyleSelected} className="flex flex-wrap gap-2">
                                            {interiorStyles.map(item => (
                                                <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", styleSelected === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={item} className="sr-only" />
                                                    {item}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-3">
                                            <Label>Color Palette</Label>
                                            <RadioGroup value={colorPalette} onValueChange={setColorPalette} className="flex flex-wrap gap-2">
                                                {colorPalettes.map(item => (
                                                    <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", colorPalette === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                        <RadioGroupItem value={item} className="sr-only" />
                                                        {item}
                                                    </Label>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                         <div className="space-y-3">
                                            <Label>Lighting Mood</Label>
                                            <RadioGroup value={lightingMood} onValueChange={setLightingMood} className="flex flex-wrap gap-2">
                                                {lightingMoods.map(item => (
                                                    <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", lightingMood === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                        <RadioGroupItem value={item} className="sr-only" />
                                                        {item}
                                                    </Label>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3 pt-2">
                                        <Checkbox id="consent" checked={consentChecked} onCheckedChange={(checked) => setConsentChecked(checked as boolean)} className="mt-1" disabled={isProcessing}/>
                                        <Label htmlFor="consent" className="text-xs font-normal text-muted-foreground">
                                           By generating, you confirm you own or have permission to edit this photo.
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
                                    <CardTitle>Design Ready!</CardTitle>
                                    <CardDescription>Download your new interior design or start over.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                            <RefreshCw className="mr-2 h-5 w-5" />
                                            Generate Another
                                        </Button>
                                        <Button size="lg" asChild className="h-12 w-full rounded-2xl" disabled={!processedImageUrl}>
                                            <a href={processedImageUrl!} download={`magicpixa-interior-design.png`}>
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

    