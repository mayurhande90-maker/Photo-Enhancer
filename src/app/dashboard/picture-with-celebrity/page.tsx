
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
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, User, Download, RefreshCw, PartyPopper, Film, Mountain, Trees, Building, Home, Award, Ship, Star, UserCheck, Users, Briefcase } from 'lucide-react';
import { features } from '@/lib/features';

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
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const [selectedCelebrity, setSelectedCelebrity] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);

    const handleFileSelect = (file: File) => {
        handleReset();
        setOriginalFile(file);
        fileToDataUri(file).then(setOriginalDataUri);
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
    };

    const isReadyToGenerate = useMemo(() => {
        return !!originalFile && !!selectedCelebrity && !!selectedLocation && consentChecked && !!user && !isProcessing && !isCreditLoading;
    }, [originalFile, selectedCelebrity, selectedLocation, consentChecked, user, isProcessing, isCreditLoading]);

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side - Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>1. Upload Your Photo</CardTitle>
                            <CardDescription>Upload a clear, high-quality, front-facing photo of yourself. Avoid group photos or side profiles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUploader onFileSelect={handleFileSelect} />
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                        <CardHeader>
                            <CardTitle>2. Select Celebrity & Location</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="celebrity-select">Celebrity</Label>
                                <Select onValueChange={setSelectedCelebrity} value={selectedCelebrity}>
                                    <SelectTrigger id="celebrity-select"><SelectValue placeholder="Choose a celebrity" /></SelectTrigger>
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
                                <Select onValueChange={setSelectedLocation} value={selectedLocation}>
                                    <SelectTrigger id="location-select"><SelectValue placeholder="Choose a location" /></SelectTrigger>
                                    <SelectContent>
                                        {locationList.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                         <CardHeader>
                            <CardTitle>3. Consent & Generation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Checkbox id="consent" checked={consentChecked} onCheckedChange={(checked) => setConsentChecked(checked as boolean)} className="mt-1"/>
                                <Label htmlFor="consent" className="text-sm font-normal text-muted-foreground">
                                    By continuing, I understand that the generated image is for entertainment purposes only and should not be used for impersonation, defamation, or any form of misuse. Magicpixa is not responsible for any third-party use or misrepresentation of the generated image.
                                </Label>
                            </div>
                             <Button size="lg" className="w-full h-12 rounded-2xl" onClick={handleProcessImage} disabled={!isReadyToGenerate}>
                                <Wand2 className="mr-2 h-5 w-5" />
                                {isProcessing ? 'Generating...' : `Generate for ${feature.creditCost} Credits`}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right side - Output */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-3xl sticky top-24">
                        <CardHeader>
                            <CardTitle>Your Hyper-Realistic Photo</CardTitle>
                            <CardDescription>The final generated image will appear here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-square w-full rounded-2xl border-2 border-dashed bg-muted flex items-center justify-center">
                                {isProcessing && (
                                    <div className="text-center p-4">
                                        <h3 className="font-semibold text-lg text-primary">✨ Generating your photo...</h3>
                                        <Progress value={progress} className="w-full max-w-sm mx-auto mt-4" />
                                    </div>
                                )}
                                {!isProcessing && processedImageUrl && (
                                    <Image src={processedImageUrl} alt="Generated" layout="fill" className="object-contain rounded-2xl" />
                                )}
                                {!isProcessing && !processedImageUrl && (
                                    <div className="text-center text-muted-foreground p-4">
                                        <Star className="mx-auto h-12 w-12" />
                                        <p className="mt-2">Waiting for generation</p>
                                    </div>
                                )}
                            </div>
                             {error && !isProcessing && (
                                <Alert variant="destructive" className="mt-4 rounded-2xl">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" className="w-full rounded-2xl" onClick={handleReset} disabled={isProcessing}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Start Over
                                </Button>
                                <Button asChild className="w-full rounded-2xl" disabled={!processedImageUrl || isProcessing}>
                                    <a href={processedImageUrl!} download={`magicpixa-celebrity-${Date.now()}.png`}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
