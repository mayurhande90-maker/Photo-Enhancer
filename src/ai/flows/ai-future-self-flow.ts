
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
    
  },
  async (input) => {
    
    const prompt = `Age the person in this photo by ${input.ageGap} years, maintaining their core features and a photorealistic look.`;

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
