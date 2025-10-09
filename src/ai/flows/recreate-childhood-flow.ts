
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

      Task: Recreate the scene based on the provided inputs.

      Inputs:
      - Mode: ${input.inputType}
      ${input.memoryText ? `- Memory text: "${input.memoryText}"` : ''}
      - Place type: ${input.placeType}
      - Style: ${input.style}
      - Intensity: ${input.intensity}

      Requirements:
      1.  If a reference photo is provided, preserve its perspective and subject framing. Extend or replace the background to show modern updates (paved roads, modern vehicles, new signage, renovated facades) based on the selected intensity.
      2.  If text-only, generate a plausible, location-consistent modern scene aligned with placeType and memoryText.
      3.  If people are in the original photo and 'preservePeople' is true, keep their facial geometry and expression but do not make them older unless specified.
      4.  Match shadows, color temperature, and depth-of-field to the original photo or memory mood.
      5.  Output one high-quality image. Add a discreet 'Magicpixa' watermark in the corner.

      Negative prompt: no face-swapping, no adding celebrities, no copyrighted logos, no extreme caricature, no nudity.
    `;

    const promptParts: any[] = [];
    if (input.photoDataUri) {
        promptParts.push({ media: { url: input.photoDataUri } });
    }
    promptParts.push({ text: prompt });

    const { media } = await ai.generate({
      prompt: promptParts,
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
