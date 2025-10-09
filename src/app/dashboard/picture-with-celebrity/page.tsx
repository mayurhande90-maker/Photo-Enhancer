
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useCredit } from '@/hooks/use-credit';
import { useToast } from '@/hooks/use-toast';
import { pictureWithCelebrityAction } from '@/app/actions';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Download, RefreshCw, Star, Users, Lightbulb, CheckCircle2, Sparkles, Loader2, Info } from 'lucide-react';
import { features } from '@/lib/features';
import { analyzeImageAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const celebrityList = {
    "Bollywood": ["Shah Rukh Khan", "Deepika Padukone", "Salman Khan", "Alia Bhatt", "Ranbir Kapoor"],
    "South Film Industry": ["Allu Arjun", "Rashmika Mandanna", "Vijay", "Samantha Ruth Prabhu"],
    "Hollywood": ["Tom Cruise", "Emma Watson", "Robert Downey Jr.", "Scarlett Johansson"],
    "Marathi Industry": ["Riteish Deshmukh", "Sai Tamhankar", "Amruta Khanvilkar"],
    "Sports": ["Virat Kohli", "M.S. Dhoni", "Sachin Tendulkar", "P.V. Sindhu"],
    "Political": ["Narendra Modi", "Barack Obama"],
    "Influencers": ["CarryMinati", "Prajakta Koli", "Bhuvan Bam", "Dolly Singh"]
};

const locationList = [
    "Party", "Stadium", "Trek", "Garden", "Office", "Home", "Red carpet", "Beach", "Film set", "Event"
];

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const BeforeUploadState = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <FileUploader onFileSelect={onFileSelect} />
        <div className="text-center p-8 rounded-3xl border-2 border-dashed border-border h-full bg-card/50 flex flex-col justify-center">
            <Lightbulb className="mx-auto h-10 w-10 text-yellow-400 mb-4" />
            <h3 className="font-semibold text-lg text-foreground">Tips for Best Results</h3>
            <ul className="text-muted-foreground text-sm mt-2 space-y-1 list-disc list-inside text-left mx-auto">
                <li>Upload only high-quality, front-facing photos.</li>
                <li>Avoid group photos or side profiles.</li>
                <li>Ensure good lighting and clear face visibility.</li>
            </ul>
        </div>
    </div>
);


export default function PictureWithCelebrityPage() {
    const feature = features.find(f => f.name === 'Picture with Celebrity')!;
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

    const [selectedCelebrity, setSelectedCelebrity] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
          setProgress(0);
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
        return () => clearInterval(interval);
      }, [isProcessing]);

    const handleFileSelect = (file: File) => {
        handleReset();
        setOriginalFile(file);
        fileToDataUri(file).then(dataUri => {
            setOriginalDataUri(dataUri);
        });
    };

    const handleProcessImage = async () => {
        if (!originalFile || !user || !originalDataUri || !firestore || !selectedCelebrity || !selectedLocation || !consentChecked) return;

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
            const result = await pictureWithCelebrityAction(originalDataUri, selectedCelebrity, selectedLocation, user.uid);
            
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
        setProcessedImageUrl(null);
        setError(null);
        setIsProcessing(false);
    };

    const isReadyToGenerate = useMemo(() => {
        return !!originalFile && !!selectedCelebrity && !!selectedLocation && consentChecked && !!user && !isProcessing && !isCreditLoading;
    }, [originalFile, selectedCelebrity, selectedLocation, consentChecked, user, isProcessing, isCreditLoading]);
    
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
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <feature.icon className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                    </div>
                    <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description} This costs {feature.creditCost} credits.</p>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section>
                <h2 className="text-2xl font-semibold mb-4">Try It Yourself</h2>
                
                {!originalDataUri && <BeforeUploadState onFileSelect={handleFileSelect} />}

                {originalDataUri && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                         <div>
                            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                                <Image src={processedImageUrl || originalDataUri} alt="Original upload" fill className={cn("object-contain transition-all duration-500", isProcessing && "opacity-50 blur-sm")} />

                                {isProcessing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-sm">
                                        <Wand2 className="h-12 w-12 animate-pulse" />
                                        <p className="mt-4 font-semibold text-lg">Generating your masterpiece...</p>
                                        <Progress value={progress} className="w-4/5 max-w-sm mx-auto mt-2" />
                                        <p className="text-sm mt-1">{progress}%</p>
                                    </div>
                                )}
                            </div>
                            
                            {isResultReady && (
                                <div className="mt-4 flex justify-center">
                                    <Card className="w-full max-w-md rounded-3xl">
                                        <CardHeader className="text-center">
                                            <CardTitle>Result Ready</CardTitle>
                                            <CardDescription>Your image is ready. Download it or start over.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                                <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleReset}>
                                                    <RefreshCw className="mr-2 h-5 w-5" />
                                                    Generate Another
                                                </Button>
                                                <Button size="lg" asChild className="h-12 w-full rounded-2xl" disabled={!processedImageUrl}>
                                                    <a href={processedImageUrl!} download={`magicpixa-celebrity-${Date.now()}.png`}>
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
                       
                        <Card className="rounded-3xl h-full sticky top-24">
                                <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                                <CardDescription>Choose your celebrity and location to generate the image.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="celebrity-select">Celebrity</Label>
                                        <Select onValueChange={setSelectedCelebrity} value={selectedCelebrity} disabled={isProcessing}>
                                            <SelectTrigger id="celebrity-select"><SelectValue placeholder="Choose one..." /></SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(celebrityList).map(([group, celebs]) => (
                                                    <div key={group}>
                                                        <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group}</p>
                                                        {celebs.map(celeb => <SelectItem key={celeb} value={celeb}>{celeb}</SelectItem>)}
                                                    </div>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location-select">Location</Label>
                                        <Select onValueChange={setSelectedLocation} value={selectedLocation} disabled={isProcessing}>
                                            <SelectTrigger id="location-select"><SelectValue placeholder="Choose one..." /></SelectTrigger>
                                            <SelectContent>
                                                {locationList.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 pt-2">
                                    <Checkbox id="consent" checked={consentChecked} onCheckedChange={(checked) => setConsentChecked(checked as boolean)} className="mt-1" disabled={isProcessing}/>
                                    <Label htmlFor="consent" className="text-xs font-normal text-muted-foreground">
                                        By continuing, I understand that the generated image is for entertainment purposes only and should not be used for impersonation, defamation, or any form of misuse.
                                    </Label>
                                </div>
                                {renderQuotaAlert()}
                                <Button size="lg" className="rounded-2xl h-12 w-full" onClick={handleProcessImage} disabled={!isReadyToGenerate}>
                                    <Wand2 className="mr-2 h-5 w-5" />
                                    {`Generate for ${feature.creditCost} Credits`}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </section>
        </div>
    );
}
