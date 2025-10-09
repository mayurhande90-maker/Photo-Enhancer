
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
      You are a hyper-realistic photo generation expert. Your task is to create a new, authentic, and natural-looking photograph featuring two people: a user and a celebrity, placed within a specified location.

      **CRITICAL RULES:**
      1.  **PRESERVE IDENTITIES:** Do NOT alter the facial features, body structure, or distinct characteristics of the user or the celebrity in any way. Their identities must be perfectly preserved.
      2.  **NATURAL INTEGRATION:** Blend the user and the celebrity (${input.celebrityName}) seamlessly into the chosen location: "${input.locationName}".
      3.  **REALISTIC ADJUSTMENTS:**
          *   **Lighting & Shadows:** Apply realistic lighting and shadows to both individuals that match the environment of the "${input.locationName}".
          *   **Clothing:** Adapt their clothing to be appropriate for the location (e.g., casual for a beach, formal for a red carpet).
          *   **Scale & Perspective:** Ensure both figures are proportionate to each other and the background.
      4.  **PHOTOGRAPHIC QUALITY:** The final image must look like a real photograph, not an AI composite. Apply a subtle, natural filmic grain to enhance authenticity.
      5.  **WATERMARK:** Add a small, discreet watermark in the bottom-right corner that says 'Magicpixa'.

      **INPUTS:**
      *   User's Photo: {{media url=userPhotoDataUri}}
      *   Celebrity: ${input.celebrityName}
      *   Location: ${input.locationName}

      Generate a single, hyper-realistic 512x512 image based on these instructions.
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
