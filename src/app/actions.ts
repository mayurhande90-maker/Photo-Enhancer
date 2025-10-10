
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
import { saveAIOutput } from './firebase/auth/client-update-profile';

async function processImageWithAI(
  photoDataUri: string,
  enhancementPrompt: string
): Promise<{ enhancedPhotoDataUri: string }> {
  const result = await enhanceFromPrompt({ photoDataUri, enhancementPrompt });
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

export async function colorCorrectAction(app: FirebaseApp, firestore: Firestore, photoDataUri: string, userId: string) {
  const prompt =
    'MODE: Color Correction. You are a high-end, AI-powered photo editor. Your task is to apply a true, visible enhancement to this photograph. You MUST NOT return the original image. First, perform a deep visual analysis of the image. Then, execute a professional color correction. Adjust brightness, contrast, exposure, and white balance to create a clean, natural, and modern aesthetic. Do not over-saturate. Skin tones must remain true-to-life. Preserve the fundamental identity and features of any person or subject. The final output MUST be visibly different and superior in quality. Add a small, discreet "Magicpixa" watermark in a bottom corner to confirm processing.';
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}

export async function restorePhotoAction(app: FirebaseApp, firestore: Firestore, photoDataUri: string, userId: string) {
  const prompt =
    'MODE: Restoration. You are a high-precision, AI-powered photo restoration specialist. Your task is to apply a true, visible enhancement to this photograph. You MUST NOT return the original image. First, perform a deep visual analysis. If the photo is blurry, low-quality, or has poor focus, you must restore it. Enhance sharpness, improve focus, and upscale the resolution. Correct any noise or lighting issues. The final output MUST be a visibly clearer, sharper, and higher-quality version. Add a small, discreet "Magicpixa" watermark in a bottom corner to confirm processing.';
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}


export async function removeBackgroundAction(app: FirebaseApp, firestore: Firestore, photoDataUri: string, userId:string) {
  const prompt =
    "Thoroughly and precisely analyze the image to identify the main subject. Your output MUST be a high-resolution, transparent PNG. Generate a new image of the exact same subject but with the background completely removed and made transparent. Ensure every part of the background is removed, leaving no artifacts, remnants, or shadows. The edges around the subject must be perfectly clean, sharp, and meticulously precise.";
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}

export async function studioEnhanceAction(app: FirebaseApp, firestore: Firestore, photoDataUri: string, userId:string) {
  const prompt =
    'This is a product photo. Enhance it for an e-commerce website. Detect the product type, and create a professional and appealing background. Improve lighting and color to make the product stand out. Do not change the text and design on the product packaging.';
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}

export async function colorizePhotoAction(app: FirebaseApp, firestore: Firestore, photoDataUri: string, userId: string) {
  const result = await colorizePhoto({ photoDataUri });
  return result;
}

export async function pictureWithCelebrityAction(app: FirebaseApp, firestore: Firestore, userPhotoDataUri: string, celebrity: string, location: string, userId: string) {
  const result = await pictureWithCelebrity({ 
    userPhotoDataUri: userPhotoDataUri, 
    celebrityName: celebrity,
    locationName: location 
  });
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
    return result;
}
