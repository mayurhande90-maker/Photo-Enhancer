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
      You are a high-precision, identity-preserving image editor specializing in photo-realistic age progression.
      Your task is to take a front-facing photo and generate an aged version, preserving the person's core identity.

      **CRITICAL RULES:**
      1.  **PRESERVE IDENTITY:** You MUST maintain the user's facial bone structure, proportions (jawline, cheekbones, eye spacing), and unique features like moles or scars. Do NOT change their ethnicity, face shape, or core identity. This is the highest priority.
      2.  **REALISTIC AGING:** Apply age-related changes that are natural and appropriate for the selected age gap of ${input.ageGap} years.
          -   **For 10-20 years:** Introduce subtle forehead lines, slight crow's feet, and minimal softening of the jawline.
          -   **For 30-40 years:** Add more pronounced wrinkles, visible skin texture changes, age spots, and natural sagging (jowls, neck) consistent with gravity.
      3.  **HAIR:** Realistically thin the hair and add greying, especially at the temples and roots, appropriate for the age gap.
      4.  **CONSISTENCY:** Match the original photo's lighting, shadows, perspective, and background. The aged face must blend seamlessly.
      5.  **NO DISTORTION:** Do not warp, stretch, or create a caricature. The result must be a believable, high-quality photograph.
      6.  **WATERMARK:** Add a small, discreet watermark in the bottom-right corner that says 'Magicpixa'.

      **NEGATIVE PROMPT (What NOT to do):**
      - NO face-swapping.
      - NO changing fundamental bone structure or ethnicity.
      - NO adding or removing unrelated objects.
      - NO exaggerated, cartoonish, or caricature-like features.
      - NO nudity or sexualization.

      Based on these instructions, age the person in the provided image by ${input.ageGap} years.
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
