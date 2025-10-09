'use server';

/**
 * @fileOverview Generates a photo-realistic aged version of a user's photo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIFutureSelfInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A clear, front-facing mid-shot photo of the user, as a data URI."
    ),
  ageGap: z.number().describe('The number of years to age the person in the photo (e.g., 10, 20, 30, 40).'),
});
export type AIFutureSelfInput = z.infer<typeof AIFutureSelfInputSchema>;

const AIFutureSelfOutputSchema = z.object({
  agedPhotoDataUri: z
    .string()
    .describe('The generated photo of the aged user, as a data URI.'),
});
export type AIFutureSelfOutput = z.infer<typeof AIFutureSelfOutputSchema>;


export async function generateFutureSelf(input: AIFutureSelfInput): Promise<AIFutureSelfOutput> {
  return aiFutureSelfFlow(input);
}


const aiFutureSelfFlow = ai.defineFlow(
  {
    name: 'aiFutureSelfFlow',
    inputSchema: AIFutureSelfInputSchema,
    outputSchema: AIFutureSelfOutputSchema,
    retries: 2,
  },
  async (input) => {
    const prompt = `
      You are a high-precision, identity-preserving image editor. Your ONLY task is to apply realistic aging effects to the provided photograph.

      **CRITICAL DIRECTIVES (NON-NEGOTIABLE):**
      1.  **IDENTITY LOCK (HIGHEST PRIORITY):** You MUST NOT change the person's core identity. The face in the output image must be the SAME person as in the input image. Preserve their facial bone structure, proportions (jawline, cheekbones, eye spacing), ethnicity, and unique features like moles or scars.
      2.  **EDIT, DO NOT REPLACE:** This is an image editing task, NOT a generation task. Use the provided photo as the base and apply aging layers on top of it. Do not invent a new face.
      3.  **REALISTIC AGING:** Apply natural and subtle age-related changes appropriate for the selected age gap of ${input.ageGap} years.
          -   Introduce forehead lines, crow's feet, skin texture changes, and natural gravitational sagging (jowls, neck) as appropriate for the age.
          -   Realistically thin the hair and add greying, especially at the temples and roots.
      4.  **CONSISTENCY:** Match the original photo's lighting, shadows, perspective, and background. The result must be seamless.
      5.  **WATERMARK:** Add a small, discreet watermark in the bottom-right corner that says 'Magicpixa'.

      **NEGATIVE PROMPT (WHAT NOT TO DO):**
      - **NO FACE SWAPPING.**
      - **NO changing the person's fundamental bone structure or facial identity.**
      - NO creating a different person.
      - NO exaggerated, cartoonish, or caricature-like features.

      Based on these strict instructions, edit the provided image to age the person by ${input.ageGap} years while maintaining their exact identity.
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

    return { agedPhotoDataUri: media.url };
  }
);
