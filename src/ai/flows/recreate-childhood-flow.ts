
'use server';

/**
 * @fileOverview Creates a modernized visual scene from a user's childhood memory (photo or text).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecreateChildhoodInputSchema, RecreateChildhoodOutputSchema, RecreateChildhoodInput } from '@/lib/types';

export async function recreateChildhoodScene(input: RecreateChildhoodInput): Promise<z.infer<typeof RecreateChildhoodOutputSchema>> {
  return recreateChildhoodFlow(input);
}

const recreateChildhoodFlow = ai.defineFlow(
  {
    name: 'recreateChildhoodFlow',
    inputSchema: RecreateChildhoodInputSchema,
    outputSchema: RecreateChildhoodOutputSchema,
    retries: 2,
  },
  async (input) => {
    const prompt = `
      You are a high-precision scene modernization model. Your job is to recreate a user's childhood place as it would realistically appear today, preserving identifiable people when permitted, and matching lighting, perspective, and local context.

      Task: Recreate the scene described below as it would realistically appear today.

      Inputs:
      - Mode: ${input.inputType}
      ${input.memoryText ? `- Memory text: "${input.memoryText}"` : ''}
      - Place type: ${input.placeType}
      - Style: ${input.style}
      - Intensity: ${input.intensity}

      Generation requirements:
      1. If a reference photo is provided, preserve perspective and subject framing; extend or replace background to show modern updates (paved road, vehicles, modern signage, renovated facades).
      2. If text-only, generate a plausible, location-consistent modern scene aligned with placeType and memoryText.
      3. Modernize based on intensity:
         - mild: subtle updates (cleaner road, small modern fixtures)
         - normal: visible modern elements (LED lights, parked modern bikes/cars, new paint)
         - high: major modernization (renovated buildings, modern retail signage, paved road, modern vehicles)
      4. If people are in the original photo and 'preservePeople' is true, keep their facial geometry and expression but do not make them older unless specified.
      5. Match shadows, color temperature, and depth-of-field to the original photo or memory mood.
      6. Output one high-quality image.

      Negative prompt: no face-swapping, no adding celebrities, no copyrighted logos, no extreme caricature, no nudity.
    `;

    const { media } = await ai.generate({
      prompt: input.photoDataUri
        ? [{ media: { url: input.photoDataUri } }, { text: prompt }]
        : prompt,
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a result.');
    }

    return { modernizedPhotoDataUri: media.url };
  }
);
