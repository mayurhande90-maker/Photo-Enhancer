
'use server';

/**
 * @fileOverview Colorizes and restores vintage photos.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ColorizePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A vintage photo to colorize, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type ColorizePhotoInput = z.infer<typeof ColorizePhotoInputSchema>;

const ColorizePhotoOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The colorized and restored photo, as a data URI.'),
});
export type ColorizePhotoOutput = z.infer<typeof ColorizePhotoOutputSchema>;

export async function colorizePhoto(input: ColorizePhotoInput): Promise<ColorizePhotoOutput> {
  return colorizePhotoFlow(input);
}

const colorizePhotoFlow = ai.defineFlow(
  {
    name: 'colorizePhotoFlow',
    inputSchema: ColorizePhotoInputSchema,
    outputSchema: ColorizePhotoOutputSchema,
    
  },
  async input => {
    const prompt = `You are an expert photo restoration specialist. Restore and colourize the provided vintage photograph. 
    
    **CRITICAL RULES:**
    1.  **COLORIZE REALISTICALLY:** Apply natural, lifelike colors to the scene, including skin tones, clothing, and background elements. The result should feel authentic and not artificial.
    2.  **RESTORE & ENHANCE:** Repair any visible damage like cracks, dust, or fading. Enhance clarity and fine details while preserving the original's character.
    3.  **PRESERVE IDENTITY:** Do not alter the facial features, expressions, or posture of any person in the photo.
    4.  **WATERMARK:** Add a small, discreet watermark in a bottom corner that says 'Made by Magicpixa'.
    
    The final output should be a photo-realistic, high-quality restoration.`;

    const {media} = await ai.generate({
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: prompt},
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
        throw new Error('Image generation failed to produce a result.');
    }

    return {enhancedPhotoDataUri: media.url};
  }
);
