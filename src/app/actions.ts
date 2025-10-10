
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

export async function colorCorrectAction(photoDataUri: string, userId: string) {
  const prompt =
    'Perform a professional color correction on this photo. Adjust colors, brightness, contrast, and exposure to create a visually balanced and aesthetically modern look. Refine tones but maintain a natural appearance without over-saturation. Preserve the identity of any subjects and the core composition.';
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}

export async function restorePhotoAction(photoDataUri: string, userId: string) {
  const prompt =
    'Restore this photograph. If the image is blurry, low-quality, or poorly clicked, enhance its sharpness, fix focus, and improve resolution using AI upscaling. Clean any digital noise, correct the lighting, and improve overall detail and clarity. Preserve the original subjects and composition.';
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}


export async function removeBackgroundAction(photoDataUri: string, userId:string) {
  const prompt =
    "Thoroughly and precisely analyze the image to identify the main subject. Your output MUST be a high-resolution, transparent PNG. Generate a new image of the exact same subject but with the background completely removed and made transparent. Ensure every part of the background is removed, leaving no artifacts, remnants, or shadows. The edges around the subject must be perfectly clean, sharp, and meticulously precise.";
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}

export async function studioEnhanceAction(photoDataUri: string, userId:string) {
  const prompt =
    'This is a product photo. Enhance it for an e-commerce website. Detect the product type, and create a professional and appealing background. Improve lighting and color to make the product stand out. Do not change the text and design on the product packaging.';
  const result = await processImageWithAI(photoDataUri, prompt);
  return result;
}

export async function colorizePhotoAction(photoDataUri: string, userId: string) {
  const result = await colorizePhoto({ photoDataUri });
  return result;
}

export async function pictureWithCelebrityAction(photoDataUri: string, celebrity: string, location: string, userId: string) {
  const result = await pictureWithCelebrity({ 
    userPhotoDataUri: photoDataUri, 
    celebrityName: celebrity,
    locationName: location 
  });
  return result;
}

export async function createYoutubeThumbnailAction(
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
    photoDataUri: string,
    userId: string,
    platform: string,
    tone: string,
    goal: string
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
    userId: string,
    roomType: string,
    styleSelected: string,
    options: {
        colorPalette: string;
    }
) {
    const result = await createMagicInterior({
        photoDataUri,
        roomType,
        styleSelected,
        options,
    });
    return result;
}
