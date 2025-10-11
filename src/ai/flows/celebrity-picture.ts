
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
    const prompt = ``;

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
