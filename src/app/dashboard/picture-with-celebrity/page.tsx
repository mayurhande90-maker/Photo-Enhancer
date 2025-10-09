
'use client';

import { useState, useMemo } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Download, RefreshCw, Star, Users, Lightbulb, CheckCircle2, Sparkles } from 'lucide-react';
import { features } from '@/lib/features';
import { analyzeImageAction } from '@/app/actions';

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

const BeforeUploadState = () => (
    <div className="text-center p-8 rounded-3xl border-2 border-dashed border-border h-full bg-card/50 flex flex-col justify-center">
        <Lightbulb className="mx-auto h-10 w-10 text-yellow-400 mb-4" />
        <h3 className="font-semibold text-lg text-foreground">Tip: Upload a clear, high-quality, front-facing photo.</h3>
        <p className="text-muted-foreground text-sm mt-1">Avoid group photos or side profiles. For best results.</p>
    </div>
);

const AfterUploadState = ({ file, analysis }: { file: File; analysis: string; }) => (
    <div className="p-6 rounded-3xl bg-card/50 h-full flex flex-col justify-center animate-fade-in-up">
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
    const [imageAnalysis, setImageAnalysis] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const [selectedCelebrity, setSelectedCelebrity] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);

    const handleFileSelect = (file: File) => {
        handleReset();
        setOriginalFile(file);
        fileToDataUri(file).then(dataUri => {
            setOriginalDataUri(dataUri);
            setImageAnalysis("Analyzing image...");
            analyzeImageAction(dataUri)
                .then(result => setImageAnalysis(result.analysis))
                .catch(() => setImageAnalysis("Perfect upload! Let’s see what Magicpixa can do."));
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
        setProgress(0);
        setProcessedImageUrl(null);

        const loadingInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 95));
        }, 500);

        try {
            const result = await pictureWithCelebrityAction(originalDataUri, selectedCelebrity, selectedLocation, user.uid);
            
            if (result.enhancedPhotoDataUri) {
                setProcessedImageUrl(result.enhancedPhotoDataUri);
                await saveAIOutput(feature.name, result.enhancedPhotoDataUri, 'image/jpeg', user.uid);
            } else {
                throw new Error('AI generation failed to return an image.');
            }
            await consumeCredits(feature.creditCost);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            toast({ title: 'Processing Error', description: errorMessage, variant: 'destructive' });
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

    const isReadyToGenerate = useMemo(() => {
        return !!originalFile && !!selectedCelebrity && !!selectedLocation && consentChecked && !!user && !isProcessing && !isCreditLoading && imageAnalysis !== "Analyzing image...";
    }, [originalFile, selectedCelebrity, selectedLocation, consentChecked, user, isProcessing, isCreditLoading, imageAnalysis]);
    
    const isResultReady = !!processedImageUrl && !isProcessing;
    const isAwaitingUpload = !originalDataUri;

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
                
                <div className="mb-8">
                  {isAwaitingUpload && <FileUploader onFileSelect={handleFileSelect} />}
                  {!isAwaitingUpload && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border">
                            <Image src={originalDataUri!} alt="Original upload" fill className="object-contain" />
                            <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">Original</div>
                        </div>
                        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border bg-muted flex items-center justify-center">
                           {isProcessing ? (
                                <div className="text-center p-4">
                                    <h3 className="font-semibold text-lg text-primary">✨ Generating your photo...</h3>
                                    <Progress value={progress} className="w-full max-w-sm mx-auto mt-4" />
                                </div>
                           ) : processedImageUrl ? (
                                <>
                                    <Image src={processedImageUrl} alt="Generated" layout="fill" className="object-contain" />
                                    <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">Generated</div>
                                </>
                           ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <Star className="mx-auto h-12 w-12" />
                                    <p className="mt-2">Output will appear here</p>
                                </div>
                           )}
                        </div>
                    </div>
                  )}
                </div>

                {isResultReady ? (
                    <div className="flex justify-center">
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
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            {isAwaitingUpload && <BeforeUploadState />}
                            {!isAwaitingUpload && !isProcessing && originalFile && <AfterUploadState file={originalFile} analysis={imageAnalysis} />}
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
                                        I understand this is for entertainment and will not be used for misuse, impersonation or defamation.
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
