'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useCredit } from '@/hooks/use-credit';
import { useToast } from '@/hooks/use-toast';
import { memorySceneAction } from '@/app/actions';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Download, RefreshCw, Users, Lightbulb, CheckCircle2, Sparkles, Loader2, Bot, Clock, Home, Image as ImageIcon, FileText } from 'lucide-react';
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
            <li>Use a clear, front-facing photo or a short 1-2 line memory.</li>
            <li>For photos, landscape or mid-shots work best.</li>
            <li>Avoid heavy sunglasses or face obstructions.</li>
        </ul>
    </div>
);

const modes = ["Restore Photo", "Recreate from Memory", "Stylize Photo"];
const eras = ["Original", "1990s", "2000s", "2010s", "Modern"];
const styles = ["Photo-realistic", "Cinematic", "Vintage Film Grain", "Painterly"];

export default function MemoryScenePage() {
    const feature = features.find(f => f.name === 'Memory Scene')!;
    const { toast } = useToast();
    const { user, loading: isUserLoading } = useUser();
    const { credits, isLoading: isCreditLoading, consumeCredits } = useCredit();
    const firestore = useFirestore();

    const [inputType, setInputType] = useState('photo');
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
    const [memoryText, setMemoryText] = useState('');
    
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const [mode, setMode] = useState(modes[0]);
    const [eraHint, setEraHint] = useState(eras[0]);
    const [style, setStyle] = useState(styles[0]);
    const [consentChecked, setConsentChecked] = useState(false);
    
    const [processingText, setProcessingText] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
          setProgress(0);
          setProcessingText(`Recreating your memory... this is complex, please wait!`);
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
        handleReset();
        setOriginalFile(file);
        fileToDataUri(file).then(dataUri => {
            setOriginalDataUri(dataUri);
        });
    };

    const handleProcessImage = async () => {
        if (!user || !firestore || !consentChecked) {
            toast({ title: 'Missing Information', description: 'Please provide input and give consent.', variant: 'destructive' });
            return;
        }

        if ((inputType === 'photo' && !originalFile) || (inputType === 'text' && !memoryText)) {
            toast({ title: 'Missing Input', description: `Please ${inputType === 'photo' ? 'upload a photo' : 'enter a memory'}.`, variant: 'destructive' });
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
            const result = await memorySceneAction(
                originalDataUri || '',
                memoryText,
                mode,
                eraHint,
                style,
                user.uid
            );
            
            if (result.enhancedPhotoDataUri) {
                setProcessedImageUrl(result.enhancedPhotoDataUri);
                await saveAIOutput(feature.name, result.enhancedPhotoDataUri, 'image/jpeg', user.uid);
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
    };

    const isReadyToGenerate = useMemo(() => {
        const hasInput = (inputType === 'photo' && !!originalFile) || (inputType === 'text' && !!memoryText);
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
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
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
                        <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                            
                            {isResultReady && originalDataUri && (
                                <BeforeAfterSlider
                                    before={originalDataUri}
                                    after={processedImageUrl}
                                />
                            )}
                            
                            {!isResultReady && !originalDataUri && inputType === 'photo' && (
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

                             {!isResultReady && !originalDataUri && inputType === 'text' && (
                                 <div className="p-8 text-center text-muted-foreground">
                                     <FileText className="h-12 w-12 mx-auto mb-4" />
                                     <p>The generated scene for your memory will appear here.</p>
                                 </div>
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
                                    <CardDescription>Upload a photo or describe a memory, then choose your styles.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    
                                    <Tabs value={inputType} onValueChange={setInputType}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="photo"><ImageIcon className="mr-2 h-4 w-4" />Photo</TabsTrigger>
                                            <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" />Text</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="photo" className="pt-4">
                                            {!originalFile && <p className="text-sm text-muted-foreground">Upload a photo to get started.</p>}
                                            {originalFile && <p className="text-sm text-green-500 font-medium">Photo uploaded: {originalFile.name}</p>}
                                        </TabsContent>
                                        <TabsContent value="text" className="pt-4">
                                            <Input
                                                placeholder='e.g. "My first bike at the beach, sunset, 2009"'
                                                value={memoryText}
                                                onChange={(e) => setMemoryText(e.target.value)}
                                                disabled={isProcessing}
                                            />
                                        </TabsContent>
                                    </Tabs>

                                    <div className="space-y-3">
                                        <Label>Mode</Label>
                                        <RadioGroup value={mode} onValueChange={setMode} className="flex flex-wrap gap-2">
                                            {modes.map(item => (
                                                <Label key={item} className={cn("px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors", mode === item ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={item} className="sr-only" />
                                                    {item}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Era Hint</Label>
                                            <Select onValueChange={setEraHint} value={eraHint}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {eras.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Style</Label>
                                             <Select onValueChange={setStyle} value={style}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3 pt-2">
                                        <Checkbox id="consent" checked={consentChecked} onCheckedChange={(checked) => setConsentChecked(checked as boolean)} className="mt-1" disabled={isProcessing}/>
                                        <Label htmlFor="consent" className="text-xs font-normal text-muted-foreground">
                                            I confirm I own or have permission to use this content and will not use generated images to impersonate or defame.
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
                                    <CardTitle>Memory Recreated!</CardTitle>
                                    <CardDescription>Download your image or start over.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                            <RefreshCw className="mr-2 h-5 w-5" />
                                            Generate Another
                                        </Button>
                                        <Button size="lg" asChild className="h-12 w-full rounded-2xl" disabled={!processedImageUrl}>
                                            <a href={processedImageUrl!} download={`magicpixa-memory-scene.png`}>
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

    