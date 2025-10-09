
'use server';

import { enhanceFromPrompt } from '@/ai/flows/enhance-from-prompt';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { pictureWithCelebrity } from '@/ai/flows/celebrity-picture';
import type { AnalyzeImageOutput } from '@/lib/types';

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

export async function enhancePhotoAction(photoDataUri: string, userId: string) {
  const prompt =
    'Enhance this photo by improving lighting, color, clarity, and resolution. Make it look natural and realistic. Do not change faces and body shapes.';
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

export async function colorizePhotoAction(photoDataUri: string, userId:string) {
  const prompt = `Restore and colourize the provided vintage photograph. Maintain the original composition, lighting, and emotional tone while bringing it to life in full colour. Recreate skin tones, clothes, environment, and background elements in realistic, natural colours — as if the photo was taken recently using a modern camera. Repair any visible damage such as cracks, dust, spots, blurs, or faded patches. Enhance clarity, texture, and fine details (eyes, hair strands, fabrics, background patterns). Preserve every person’s facial features, age, emotion, and body posture exactly as in the original. Do not alter identity, proportions, or composition. Style: photo-realistic restoration with gentle film warmth. Lighting should remain consistent with the original vintage exposure. Avoid artificial brightness or cartoonish tones. The result should feel emotionally authentic — like reliving a precious memory in perfect clarity. Focus on nostalgia, warmth, and realism. Finally, add a small, discreet watermark in a bottom corner that says 'Made by Magicpixa'.`;
    const result = await processImageWithAI(photoDataUri, prompt);
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
