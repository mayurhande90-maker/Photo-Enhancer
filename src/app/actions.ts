
'use server';

import { enhanceFromPrompt } from '@/ai/flows/enhance-from-prompt';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { pictureWithCelebrity } from '@/ai/flows/celebrity-picture';
import { colorizePhoto } from '@/ai/flows/colorize-photo';
import { createYouTubeThumbnail } from '@/ai/flows/youtube-thumbnail-flow';
import { generateCaptions } from '@/ai/flows/auto-captions-flow';
import { generateFutureSelf } from '@/ai/flows/ai-future-self-flow';
import { createMagicInterior } from '@/ai/flows/magic-interior-flow';
import type { AnalyzeImageOutput, AutoCaptionOutput } from '@/lib/types';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { saveAIOutput } from '@/firebase/auth/client-update-profile';

async function processImageWithAI(
  photoUrl: string,
  enhancementPrompt: string
): Promise<{ enhancedPhotoDataUri: string }> {
  const result = await enhanceFromPrompt({ photoDataUri: photoUrl, enhancementPrompt });
  return result;
}

export async function analyzeImageAction(photoDataUri: string): Promise<AnalyzeImageOutput> {
    try {
        const result = await analyzeImage({ photoDataUri });
        return result;
    } catch (error) {
        console.error('Error analyzing image:', error);
        return { analysis: "Perfect upload! Let’s see what Magicpixa can do." };
    }
}

export async function colorCorrectAction(app: FirebaseApp, firestore: Firestore, photoUrl: string, userId: string) {
  const prompt = '';
  const result = await processImageWithAI(photoUrl, prompt);
  await saveAIOutput(app, firestore, 'Photo Enhancement (Color)', result.enhancedPhotoDataUri, 'image/jpeg', userId);
  return result;
}

export async function restorePhotoAction(app: FirebaseApp, firestore: Firestore, photoUrl: string, userId: string) {
  const prompt = '';
  const result = await processImageWithAI(photoUrl, prompt);
  await saveAIOutput(app, firestore, 'Photo Enhancement (Restore)', result.enhancedPhotoDataUri, 'image/jpeg', userId);
  return result;
}


export async function removeBackgroundAction(app: FirebaseApp, firestore: Firestore, photoUrl: string, userId:string) {
  const prompt = "";
  const result = await processImageWithAI(photoUrl, prompt);
  await saveAIOutput(app, firestore, 'Background Removal', result.enhancedPhotoDataUri, 'image/png', userId);
  return result;
}

export async function studioEnhanceAction(app: FirebaseApp, firestore: Firestore, photoUrl: string, userId:string) {
  const prompt = '';
  const result = await processImageWithAI(photoUrl, prompt);
  await saveAIOutput(app, firestore, 'Photo Studio', result.enhancedPhotoDataUri, 'image/jpeg', userId);
  return result;
}

export async function colorizePhotoAction(app: FirebaseApp, firestore: Firestore, photoUrl: string, userId: string) {
  const result = await colorizePhoto({ photoDataUri: photoUrl });
  await saveAIOutput(app, firestore, 'Photo Colorize', result.enhancedPhotoDataUri, 'image/jpeg', userId);
  return result;
}

export async function pictureWithCelebrityAction(app: FirebaseApp, firestore: Firestore, userPhotoDataUri: string, celebrity: string, location: string, userId: string) {
  const result = await pictureWithCelebrity({ 
    userPhotoDataUri: userPhotoDataUri, 
    celebrityName: celebrity,
    locationName: location 
  });
  await saveAIOutput(app, firestore, 'Picture with Celebrity', result.enhancedPhotoDataUri, 'image/jpeg', userId);
  return result;
}

export async function createYoutubeThumbnailAction(
    app: FirebaseApp,
    firestore: Firestore,
    photoDataUri: string, 
    videoType: string, 
    categorySelected: string,
    moodSelected: string,
    alignmentSelected: string,
    userId: string
) {
    const result = await createYouTubeThumbnail({
        photoDataUri,
        videoType,
        categorySelected,
        moodSelected,
        alignmentSelected
    });
    await saveAIOutput(app, firestore, 'YouTube Thumbnail Creator', result.enhancedPhotoDataUri, 'image/jpeg', userId);
    return result;
}

export async function autoCaptionsAction(
    app: FirebaseApp,
    firestore: Firestore,
    photoDataUri: string,
    platform: string,
    tone: string,
    goal: string,
    userId: string
): Promise<AutoCaptionOutput> {
    const result = await generateCaptions({
        photoDataUri,
        platform,
        tone,
        goal,
        language: 'en',
    });
    // Not saving text output to creations gallery for now
    return result;
}

export async function aiFutureSelfAction(
    app: FirebaseApp, 
    firestore: Firestore, 
    photoDataUri: string, 
    ageGap: number, 
    userId: string
) {
    const result = await generateFutureSelf({ photoDataUri, ageGap });
    await saveAIOutput(app, firestore, 'AI Future Self', result.agedPhotoDataUri, 'image/jpeg', userId);
    return result;
}

export async function magicInteriorAction(
    app: FirebaseApp,
    firestore: Firestore,
    photoDataUri: string,
    roomType: string,
    styleSelected: string,
    options: {
        colorPalette: string;
    },
    userId: string
) {
    const result = await createMagicInterior({
        photoDataUri,
        roomType,
        styleSelected,
        options,
    });
    await saveAIOutput(app, firestore, 'Magic Interior', result.redesignedPhotoDataUri, 'image/jpeg', userId);
    return result;
}
