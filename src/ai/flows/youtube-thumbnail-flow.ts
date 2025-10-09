
'use server';

/**
 * @fileOverview Generates a YouTube thumbnail.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YouTubeThumbnailInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'The main photo for the thumbnail, as a data URI.'
    ),
  title: z.string().describe('The title text for the thumbnail.'),
});
export type YouTubeThumbnailInput = z.infer<typeof YouTubeThumbnailInputSchema>;

const YouTubeThumbnailOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The generated thumbnail image, as a data URI.'),
});
export type YouTubeThumbnailOutput = z.infer<typeof YouTubeThumbnailOutputSchema>;

export async function createYouTubeThumbnail(input: YouTubeThumbnailInput): Promise<YouTubeThumbnailOutput> {
  return youtubeThumbnailFlow(input);
}

const youtubeThumbnailFlow = ai.defineFlow(
  {
    name: 'youtubeThumbnailFlow',
    inputSchema: YouTubeThumbnailInputSchema,
    outputSchema: YouTubeThumbnailOutputSchema,
  },
  async (input) => {
    const prompt = `
        Generate a vibrant, professional YouTube thumbnail (1280x720) using the uploaded image as the main subject.
        Keep the subject sharply focused, expressive, and well lit.  

        Add bold, readable headline text: "${input.title}".
        
        Use vivid but natural colours, dramatic contrast, and strong subject separation.  
        Lighting should feel realistic yet dynamic, enhancing emotion and energy.  
        Keep overall design clean, exciting, and scroll-stopping—suitable for direct YouTube upload.  

        Negative prompt: boring composition, dull colors, distorted faces, unreadable text, AI artifacts, cartoonish, low detail
    `;

    const { media } = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: prompt },
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // You might want to specify dimensions if the model supports it, e.g., in a future API.
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a result.');
    }

    return { enhancedPhotoDataUri: media.url };
  }
);
