
'use server';

/**
 * @fileOverview Redesigns the interior of a user's room based on a selected style.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MagicInteriorInputSchema, MagicInteriorOutputSchema, MagicInteriorInput } from '@/lib/types';

export async function createMagicInterior(input: MagicInteriorInput): Promise<z.infer<typeof MagicInteriorOutputSchema>> {
  return magicInteriorFlow(input);
}


const magicInteriorFlow = ai.defineFlow(
  {
    name: 'magicInteriorFlow',
    inputSchema: MagicInteriorInputSchema,
    outputSchema: MagicInteriorOutputSchema,
    
  },
  async (input) => {
    const prompt = ``;

    const { media } = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: prompt },
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a result.');
    }

    return { redesignedPhotoDataUri: media.url };
  }
);
