
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
    let prompt = ``;

    if (typeof prompt !== "string") {
      prompt = JSON.stringify(prompt);
    }
    if (prompt.length > 500) {
      prompt = prompt.slice(0, 500);
    }
    const safePrompt = prompt.replace(/[^\w\s.,!?-]/g, "");

    const {media} = await ai.generate({
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: safePrompt},
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
