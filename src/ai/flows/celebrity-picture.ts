
'use server';

/**
 * @fileOverview Generates a hyper-realistic photo of a user with a celebrity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CelebrityPictureInputSchema = z.object({
  userPhotoDataUri: z
    .string()
    .describe(
      'A high-resolution, front-facing photo of the user, as a data URI.'
    ),
  celebrityName: z.string().describe('The name of the selected celebrity.'),
  locationName: z.string().describe('The name of the selected background/location.'),
});
export type CelebrityPictureInput = z.infer<typeof CelebrityPictureInputSchema>;

const CelebrityPictureOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The generated photo of the user with the celebrity, as a data URI.'),
});
export type CelebrityPictureOutput = z.infer<typeof CelebrityPictureOutputSchema>;

export async function pictureWithCelebrity(input: CelebrityPictureInput): Promise<CelebrityPictureOutput> {
  return celebrityPictureFlow(input);
}

const celebrityPictureFlow = ai.defineFlow(
  {
    name: 'celebrityPictureFlow',
    inputSchema: CelebrityPictureInputSchema,
    outputSchema: CelebrityPictureOutputSchema,
    
  },
  async (input) => {
    const prompt = `
      You are an expert photorealistic image editor. Create a single, new, authentic-looking candid mid-shot photograph featuring two people: the user from the provided image and the celebrity '${input.celebrityName}'.

      **CRITICAL RULES (NON-NEGOTIABLE):**
      1.  **IDENTITY LOCK:** You **MUST** perfectly preserve the facial and physical identity of both the user from their photo and the real-world appearance of **${input.celebrityName}**. Do not alter their core features, face shape, or ethnicity.
      2.  **SEAMLESS INTEGRATION:** Blend both individuals naturally into the chosen location: "${input.locationName}". The final image must look like a real, unposed photograph with matching lighting, shadows, and perspective.
      3.  **REALISM:** Adapt their clothing to be appropriate for the location. The final image must have realistic photographic qualities, including natural skin texture and subtle filmic grain.
      4.  **WATERMARK:** Add a small, discreet watermark in the bottom-right corner that says 'Magicpixa'.

      **NEGATIVE PROMPT:** NO face swapping, NO caricature, NO altering fundamental identities.
    `;

    const { media } = await ai.generate({
      prompt: [
        { media: { url: input.userPhotoDataUri } },
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

    return { enhancedPhotoDataUri: media.url };
  }
);
