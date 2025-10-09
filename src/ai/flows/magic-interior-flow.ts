
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
    retries: 2,
  },
  async (input) => {
    const prompt = `
      You are a hyper-realistic interior design image editor. Your ONLY task is to redesign the provided room photo.

      **CRITICAL RULES (NON-NEGOTIABLE):**
      1.  **PRESERVE STRUCTURE & PERSPECTIVE:** You MUST NOT change the room's geometry. Do not move, resize, add, or remove any walls, windows, doors, ceilings, or fixed architectural elements. The camera angle and perspective MUST remain identical.
      2.  **EDIT INTERIORS ONLY:** Only change movable items: furniture, decor, lighting, paint, and finishes.
      3.  **PRESERVE PEOPLE:** If people are in the photo, their identity, face, and body MUST NOT be changed.
      4.  **APPLY STYLE:** Redesign the interior in the **'${input.styleSelected}'** style using the **'${input.options.colorPalette}'** color palette and **'${input.options.lightingMood}'** lighting.
      5.  **WATERMARK:** Add a small, discreet watermark 'Magicpixa' in the bottom-right corner.

      Based on these strict rules, edit the provided photo of the '${input.roomType}'.
    `;

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
