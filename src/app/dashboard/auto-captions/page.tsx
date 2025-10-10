'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';
import { useCredit } from '@/hooks/use-credit';
import { useToast } from '@/hooks/use-toast';
import { autoCaptionsAction, analyzeImageAction } from '@/app/actions';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Wand2, Download, RefreshCw, Users, Lightbulb, CheckCircle2, Sparkles, Loader2, Copy, Bot } from 'lucide-react';
import { features } from '@/lib/features';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AutoCaptionOutput, AnalyzeImageOutput } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const platforms = ["Instagram Post", "Instagram Reel", "Facebook Post", "X/Twitter", "LinkedIn Post", "YouTube Community"];
const tones = ["Casual", "Friendly", "Professional", "Energetic", "Emotional", "Witty"];
const goals = ["Engagement", "Inform & Educate", "Promote Product", "Drive Clicks", "Brand Awareness"];


function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CopyButton = ({ text }: { text: string }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };
    return (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
        </Button>
    );
};

const ResultDisplay = ({ results }: { results: string }) => {
    const parsedResults = useMemo(() => {
        const sections = {
            short: '',
            medium: '',
            long: '',
            hashtags: '',
            notes: ''
        };

        if(!results) return sections;

        const shortMatch = results.match(/🪶 \*\*Caption \(Short\):\*\*\n([\s\S]*?)(?=\n\n💬|\n\n📝|\n\n🏷️|\n\n⚙️|$)/);
        if (shortMatch) sections.short = shortMatch[1].trim();

        const mediumMatch = results.match(/💬 \*\*Caption \(Medium\):\*\*\n([\s\S]*?)(?=\n\n📝|\n\n🏷️|\n\n⚙️|$)/);
        if (mediumMatch) sections.medium = mediumMatch[1].trim();
        
        const longMatch = results.match(/📝 \*\*Caption \(Long\):\*\*\n([\s\S]*?)(?=\n\n🏷️|\n\n⚙️|$)/);
        if (longMatch) sections.long = longMatch[1].trim();

        const hashtagsMatch = results.match(/🏷️ \*\*Hashtags \(Recommended\):\*\*\n([\s\S]*?)(?=\n\n⚙️|$)/);
        if (hashtagsMatch) sections.hashtags = hashtagsMatch[1].trim();

        const notesMatch = results.match(/⚙️ \*\*Auto Notes:\*\*\n([\s\S]*?)$/);
        if (notesMatch) sections.notes = notesMatch[1].trim();

        return sections;

    }, [results]);

    return (
        <Card className="rounded-3xl w-full">
            <CardHeader>
                <CardTitle>Your Captions Are Ready!</CardTitle>
                <CardDescription>Copy the text you want to use for your post.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 w-full">
                    <div className="space-y-6 pr-4">
                        {parsedResults.short && (
                            <div className="space-y-2">
                                <Label>🪶 Short Caption</Label>
                                <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedResults.short}</p>
                                    <CopyButton text={parsedResults.short} />
                                </div>
                            </div>
                        )}
                        {parsedResults.medium && (
                            <div className="space-y-2">
                                <Label>💬 Medium Caption</Label>
                                <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedResults.medium}</p>
                                    <CopyButton text={parsedResults.medium} />
                                </div>
                            </div>
                        )}
                         {parsedResults.long && (
                            <div className="space-y-2">
                                <Label>📝 Long Caption</Label>
                                <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedResults.long}</p>
                                    <CopyButton text={parsedResults.long} />
                                </div>
                            </div>
                         )}
                         {parsedResults.hashtags && (
                            <div className="space-y-2">
                                <Label>🏷️ Recommended Hashtags</Label>
                                <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedResults.hashtags}</p>
                                    <CopyButton text={parsedResults.hashtags} />
                                </div>
                            </div>
                         )}
                         {parsedResults.notes && (
                            <div className="space-y-2">
                                <Label>⚙️ Auto Notes</Label>
                                <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedResults.notes}</p>
                                    <CopyButton text={parsedResults.notes} />
                                </div>
                            </div>
                         )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};


export default function AutoCaptionsPage() {
    const feature = features.find(f => f.name === 'Auto Captions + Hashtags')!;
    const { toast } = useToast();
    const { credits, isLoading: isCreditLoading, consumeCredits } = useCredit();
    const firestore = useFirestore();
    const app = useFirebaseApp();

    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<AutoCaptionOutput | null>(null);
    const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);


    const [platform, setPlatform] = useState(platforms[0]);
    const [tone, setTone] = useState(tones[0]);
    const [goal, setGoal] = useState(goals[0]);

    const [processingText, setProcessingText] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
          setProgress(0);
          setProcessingText(`Analyzing image and writing captions...`);
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
            if(interval) clearInterval(interval);
        };
    }, [isProcessing]);

    useEffect(() => {
        if(results){
            setProgress(100);
            setIsProcessing(false);
        }
    }, [results]);

    useEffect(() => {
        if (originalDataUri && !results) {
            setImageAnalysis("Analyzing image...");
            analyzeImageAction(originalDataUri)
                .then(result => setImageAnalysis(result.analysis))
                .catch(() => setImageAnalysis("Perfect upload! Let’s see what Magicpixa can do."));
        }
    }, [originalDataUri, results]);


    const handleFileSelect = (file: File) => {
        handleReset();
        setOriginalFile(file);
        fileToDataUri(file).then(dataUri => {
            setOriginalDataUri(dataUri);
        });
    };

    const handleProcess = async () => {
        if (!originalFile || !originalDataUri || !firestore || !app) {

          toast({ title: 'Missing Information', description: `Please upload an image.`, variant: 'destructive' });
          return;
        }

        if (!isCreditLoading && credits < feature.creditCost) {
            toast({ title: 'Not Enough Credits', description: `You need ${feature.creditCost} credits.`, variant: 'destructive' });
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResults(null);

        try {
            const result = await autoCaptionsAction(app, firestore, originalDataUri, platform, tone, goal, user.uid);
            
            if (result) {
                setResults(result);
                // Not saving text output to creations for now
                // await saveAIOutput(firestore, feature.name, result, 'text/plain', user.uid);
                await consumeCredits(feature.creditCost);
            } else {
                throw new Error('AI generation failed to return captions.');
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
        setResults(null);
        setError(null);
        setIsProcessing(false);
        setProgress(0);
        setImageAnalysis(null);
    };

    const isReadyToGenerate = useMemo(() => {
        return !!originalFile && !!user && !isProcessing && !isCreditLoading && !!imageAnalysis && imageAnalysis !== "Analyzing image...";
    }, [originalFile, user, isProcessing, isCreditLoading, imageAnalysis]);
    
    const isResultReady = !!results && !isProcessing;

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
                    <Users className="h-4 w-4" />
                    <AlertTitle>Not Enough Credits</AlertTitle>
                    <AlertDescription>
                        You need {feature.creditCost} credits. <Link href="/#pricing" className="underline font-bold">Upgrade your plan</Link> for more.
                    </AlertDescription>
                </Alert>
            );
        }
        return null;
    };
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            <section>
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-cyan-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-cyan-500 text-white">
                            <feature.icon className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                    </div>
                    <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credits.</p>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section>
                <h2 className="text-2xl font-semibold mb-4">Generate Your Captions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                            {!originalDataUri && !isResultReady && (
                                <FileUploader onFileSelect={handleFileSelect} />
                            )}

                            {(originalDataUri || isResultReady) && (
                                <Image 
                                    src={originalDataUri!} 
                                    alt={"Original upload"} 
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
                    </div>
                   
                    <div>
                        {!isResultReady ? (
                             <Card className="rounded-3xl h-full sticky top-24">
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Select your target platform and desired tone.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Platform</Label>
                                        <Select onValueChange={setPlatform} value={platform} disabled={isProcessing || !originalDataUri}>
                                            <SelectTrigger><SelectValue placeholder="Choose platform..." /></SelectTrigger>
                                            <SelectContent>
                                                {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Tone</Label>
                                        <RadioGroup value={tone} onValueChange={setTone} className="flex flex-wrap gap-2">
                                            {tones.map(t => (
                                                <Label key={t} className={cn("px-3 py-1.5 border rounded-full text-sm cursor-pointer transition-colors", tone === t ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={t} className="sr-only" />
                                                    {t}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Goal</Label>
                                        <RadioGroup value={goal} onValueChange={setGoal} className="flex flex-wrap gap-2">
                                            {goals.map(g => (
                                                <Label key={g} className={cn("px-3 py-1.5 border rounded-full text-sm cursor-pointer transition-colors", goal === g ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>
                                                    <RadioGroupItem value={g} className="sr-only" />
                                                    {g}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    
                                    {renderQuotaAlert()}
                                    <Button size="lg" className="rounded-2xl h-12 w-full" onClick={handleProcess} disabled={!isReadyToGenerate}>
                                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                                        {isProcessing ? 'Generating...' : `Generate for ${feature.creditCost} Credits`}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <ResultDisplay results={results!} />
                                <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                    <RefreshCw className="mr-2 h-5 w-5" />
                                    Generate Another
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
