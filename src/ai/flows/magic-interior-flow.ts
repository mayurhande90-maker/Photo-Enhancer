
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
      You are a professional interior design image editor. Your goal is to redesign an interior space based on a user's photo and selected style.

      **CRITICAL RULES (NON-NEGOTIABLE):**
      1.  **PRESERVE STRUCTURE:** You MUST NOT change the structural geometry. Do not move, resize, add, or remove walls, windows, doors, ceilings, or any fixed architectural elements.
      2.  **PRESERVE PERSPECTIVE:** The camera angle, perspective, and vanishing points of the original photo MUST be maintained perfectly.
      3.  **EDIT ONLY INTERIORS:** You can only change interior finishes, furniture, lighting, decor, and paint.
      4.  **PRESERVE PEOPLE:** If people are in the photo, their identity, face, and body must be preserved without any changes.

      **INPUTS:**
      -   Source Photo: {{media url=${input.photoDataUri}}}
      -   Room Type: ${input.roomType}
      -   Style: ${input.styleSelected}
      -   Options: Color Palette=${input.options.colorPalette}, Lighting=${input.options.lightingMood}

      **TASK:**
      Redesign the interior of the provided photo in the **'${input.styleSelected}'** style. Apply changes only to movable furniture, decor, and finishes. Ensure the result is hyper-realistic and looks like a professionally taken photograph of a real room. Add a small, discreet watermark 'Magicpixa' in the bottom-right corner.
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
