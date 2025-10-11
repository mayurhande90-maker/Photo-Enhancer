
'use server';

/**
 * @fileOverview Colorizes and restores vintage photos.
 * THIS FEATURE IS DISABLED.
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
    // Feature disabled: returning empty data.
    return {enhancedPhotoDataUri: ''};
  }
);
