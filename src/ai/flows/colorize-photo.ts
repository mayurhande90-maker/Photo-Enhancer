
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
    retries: 2,
  },
  async input => {
    const prompt = `Restore and colourize the provided vintage photograph. Maintain the original composition, lighting, and emotional tone while bringing it to life in full colour. Recreate skin tones, clothes, environment, and background elements in realistic, natural colours — as if the photo was taken recently using a modern camera. Repair any visible damage such as cracks, dust, spots, blurs, or faded patches. Enhance clarity, texture, and fine details (eyes, hair strands, fabrics, background patterns). Preserve every person’s facial features, age, emotion, and body posture exactly as in the original. Do not alter identity, proportions, or composition. Style: photo-realistic restoration with gentle film warmth. Lighting should remain consistent with the original vintage exposure. Avoid artificial brightness or cartoonish tones. The result should feel emotionally authentic — like reliving a precious memory in perfect clarity. Focus on nostalgia, warmth, and realism. Finally, add a small, discreet watermark in a bottom corner that says 'Made by Magicpixa'.`;

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
