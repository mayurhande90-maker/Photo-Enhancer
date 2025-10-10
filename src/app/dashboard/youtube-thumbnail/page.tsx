
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';
import { useCredit } from '@/hooks/use-credit';
import { useToast } from '@/hooks/use-toast';
import { createYoutubeThumbnailAction } from '@/app/actions';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Download, RefreshCw, Users, Lightbulb, Type, Video, Palette, AlignHorizontalJustifyCenter } from 'lucide-react';
import { features } from '@/lib/features';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

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
            <li>Upload a high-quality photo of the main subject.</li>
            <li>Use a short, catchy title for maximum impact.</li>
            <li>Make sure the subject's face is clear and expressive.</li>
        </ul>
    </div>
);

const channelCategories = ["Vlog / Lifestyle", "Travel / Adventure", "Tech / Product Review", "Podcast / Interview", "Gaming / Entertainment", "Fitness / Motivation", "Educational / Tutorial", "News / Commentary"];
const thumbnailMoods = ["Dramatic / Serious", "Fun / Playful", "Cinematic / Dark", "Clean / Minimal", "Bright / Vlog Styled"];
const subjectAlignments = ["Left Aligned", "Centered", "Right Aligned"];

export default function YouTubeThumbnailPage() {
    const feature = features.find(f => f.name === 'YouTube Thumbnail Creator')!;
    const { toast } = useToast();
    const { user, loading: isUserLoading } = useUser();
    const { credits, isLoading: isCreditLoading, consumeCredits } = useCredit();
    const firestore = useFirestore();
    const app = useFirebaseApp();

    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalDataUri, setOriginalDataUri] = useState<string | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const [videoType, setVideoType] = useState('My Awesome Video');
    const [channelCategory, setChannelCategory] = useState(channelCategories[0]);
    const [thumbnailMood, setThumbnailMood] = useState(thumbnailMoods[0]);
    const [subjectAlignment, setSubjectAlignment] = useState(subjectAlignments[0]);

    const [processingText, setProcessingText] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
          setProgress(0);
          setProcessingText(`Designing your YouTube thumbnail... please wait.`);
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
        if (!originalFile || !user || !originalDataUri || !firestore || !app || !videoType || !channelCategory || !thumbnailMood || !subjectAlignment) {
          toast({
              title: 'Missing Information',
              description: `Please upload an image and fill out all configuration options.`,
              variant: 'destructive',
          });
          return;
        }

        if (!isCreditLoading && credits < feature.creditCost) {
            toast({
                title: 'Not Enough Credits',
                description: `You need ${feature.creditCost} credits for this.`,
                variant: 'destructive',
            });
            return;
        }

        setIsProcessing(true);
        setError(null);
        setProcessedImageUrl(null);

        try {
            const result = await createYoutubeThumbnailAction(
                originalDataUri, 
                videoType, 
                channelCategory,
                thumbnailMood,
                subjectAlignment,
                user.uid
            );
            
            if (result.enhancedPhotoDataUri) {
                setProcessedImageUrl(result.enhancedPhotoDataUri);
                await saveAIOutput(app, firestore, feature.name, result.enhancedPhotoDataUri, 'image/jpeg', user.uid);
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
        setVideoType('My Awesome Video');
        setChannelCategory(channelCategories[0]);
        setThumbnailMood(thumbnailMoods[0]);
        setSubjectAlignment(subjectAlignments[0]);
    };

    const isReadyToGenerate = useMemo(() => {
        return !!originalFile && !!videoType && !!channelCategory && !!thumbnailMood && !!subjectAlignment && !!user && !isProcessing && !isCreditLoading;
    }, [originalFile, videoType, channelCategory, thumbnailMood, subjectAlignment, user, isProcessing, isCreditLoading]);
    
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
                    <Users className="h-4 w-4" />
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
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-green-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 text-white">
                            <feature.icon className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                    </div>
                    <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credits.</p>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section>
                <h2 className="text-2xl font-semibold mb-4">Create Your Thumbnail</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                            {!originalDataUri && !isResultReady && (
                                <FileUploader onFileSelect={handleFileSelect} />
                            )}

                            {(originalDataUri || isResultReady) && (
                                <Image 
                                    src={processedImageUrl || originalDataUri!} 
                                    alt={processedImageUrl ? "Generated thumbnail" : "Original upload"} 
                                    fill 
                                    className={cn("object-contain transition-all duration-500", isProcessing && "opacity-50 blur-sm")} 
                                />
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-sm p-4">
                                    <Wand2 className="h-12 w-12 animate-pulse" />
                                    <p className="mt-4 font-semibold text-lg text-center">{processingText}</p>
                                    <Progress value={progress} className="w-4/5 max-w-sm mx-auto mt-2" />
                                    <p className="text-sm mt-1">{progress}%</p>
                                </div>
                            )}
                        </div>
                        {!isResultReady && <TipsSection />}
                    </div>
                   
                    {/* Right Column */}
                     <div>
                        {!isResultReady ? (
                             <Card className="rounded-3xl h-full sticky top-24">
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Enter a video type and choose your styles.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="video-type-input">Video Type</Label>
                                        <div className="relative">
                                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="video-type-input" 
                                                placeholder="e.g., Daily vlog, Phone unboxing" 
                                                value={videoType}
                                                onChange={(e) => setVideoType(e.target.value)}
                                                className="pl-9"
                                                disabled={isProcessing || !originalDataUri}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="channel-category-select">Channel Category</Label>
                                        <Select onValueChange={setChannelCategory} value={channelCategory} disabled={isProcessing || !originalDataUri}>
                                            <SelectTrigger id="channel-category-select" className="w-full">
                                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <div className="pl-5"><SelectValue placeholder="Select category..." /></div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {channelCategories.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mood-select">Thumbnail Mood / Style</Label>
                                            <Select onValueChange={setThumbnailMood} value={thumbnailMood} disabled={isProcessing || !originalDataUri}>
                                                <SelectTrigger id="mood-select" className="w-full">
                                                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <div className="pl-5"><SelectValue placeholder="Select mood..." /></div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {thumbnailMoods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="alignment-select">Subject Alignment</Label>
                                            <Select onValueChange={setSubjectAlignment} value={subjectAlignment} disabled={isProcessing || !originalDataUri}>
                                                <SelectTrigger id="alignment-select" className="w-full">
                                                    <AlignHorizontalJustifyCenter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <div className="pl-5"><SelectValue placeholder="Select alignment..." /></div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjectAlignments.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                    <CardTitle>Thumbnail Ready!</CardTitle>
                                    <CardDescription>Your thumbnail is ready. Download it or start over.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                            <RefreshCw className="mr-2 h-5 w-5" />
                                            Create Another
                                        </Button>
                                        <Button size="lg" asChild className="h-12 w-full rounded-2xl" disabled={!processedImageUrl}>
                                            <a href={processedImageUrl!} download={`magicpixa-thumbnail-${Date.now()}.png`}>
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
