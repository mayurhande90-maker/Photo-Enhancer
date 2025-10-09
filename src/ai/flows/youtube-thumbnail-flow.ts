
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
  videoType: z.string().describe('A short description of the video type, e.g., "Daily vlog" or "Phone unboxing".'),
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
      Generate a dynamic, photo-realistic YouTube thumbnail at 1280x720 resolution.

      Use the uploaded image as the main subject.
      Remove background and enhance it. Keep the subject’s face natural, sharp, and expressive.

      Create a clean, balanced composition with bold, clear text overlay.
      Generate an engaging hook line suitable for a video about '${input.videoType}', similar to trending YouTube thumbnails in India.
      Style the text to be readable and attention-grabbing without clutter.
      Use realistic lighting, natural shadows, and vibrant but professional colors.
      Output should look authentic and human-made, not AI-generated.

      Negative prompt: “distorted faces, over-saturated colors, fake lighting, blurry edges, unreadable text, cartoonish design.”
    `;

    const { media } = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: prompt },
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        width: 1280,
        height: 720,
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a result.');
    }

    return { enhancedPhotoDataUri: media.url };
  }
);
