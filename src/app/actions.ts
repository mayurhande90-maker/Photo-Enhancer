// @/app/actions.ts
'use server';

import { enhanceFromPrompt } from '@/ai/flows/enhance-from-prompt';

async function processImageWithAI(
  photoDataUri: string,
  enhancementPrompt: string
): Promise<{ enhancedPhotoDataUri: string }> {
  // TODO: Implement real credit deduction before processing.
  const result = await enhanceFromPrompt({ photoDataUri, enhancementPrompt });
  return result;
}

export async function enhancePhotoAction(photoDataUri: string) {
  const prompt =
    'Enhance this photo by improving lighting, color, clarity, and resolution. Make it look natural and realistic. Do not change faces and body shapes.';
  const result = await enhanceFromPrompt({ photoDataUri, enhancementPrompt: prompt });
  return result;
}

export async function removeBackgroundAction(photoDataUri: string) {
  const prompt =
    'Thoroughly and precisely analyze the image to identify the main subject. Generate a new image of the exact same subject but with the background completely removed and made transparent. The output MUST be a high-resolution transparent PNG with clean, sharp, and meticulously precise edges around the subject. Ensure every part of the background is removed, leaving no artifacts or remnants.';
  const result = await enhanceFromPrompt({ photoDataUri, enhancementPrompt: prompt });
  return result;
}

export async function studioEnhanceAction(photoDataUri: string) {
  const prompt =
    'This is a product photo. Enhance it for an e-commerce website. Detect the product type, and create a professional and appealing background. Improve lighting and color to make the product stand out. Do not change the text and design on the product packaging.';
  const result = await enhanceFromPrompt({ photoDataUri, enhancementPrompt: prompt });
  return result;
}

export async function colorizePhotoAction(photoDataUri: string) {
  const prompt =
    'Colorize this black and white photo naturally and professionally. If the photo is blurry or has low resolution, please enhance its quality as well. The colors should be realistic for the era the photo was taken.';
    const result = await enhanceFromPrompt({ photoDataUri, enhancementPrompt: prompt });
    return result;
}
