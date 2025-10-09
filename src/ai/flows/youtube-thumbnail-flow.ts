
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
  categorySelected: z.string().describe('The selected channel category.'),
  moodSelected: z.string().describe('The selected visual mood.'),
  alignmentSelected: z.string().describe('The selected subject alignment.'),
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
    retries: 2,
  },
  async (input) => {
    const prompt = `
      You are a professional YouTube thumbnail designer. Create a single, cinematic, scroll-stopping YouTube thumbnail (16:9 aspect ratio, 1280x720, JPG, photo-realistic).

      **CRITICAL INSTRUCTIONS:**
      1.  **SUBJECT:** Use the provided image. Remove its background and make the subject prominent, aligned to the **'${input.alignmentSelected}'** setting.
      2.  **BACKGROUND:** Create a new, dynamic, blurred background related to the channel category: "${input.categorySelected}".
      3.  **TEXT:** Generate a short, catchy, high-impact hook line based on the video type: "${input.videoType}". Place it strategically on the thumbnail.
      4.  **MOOD & FINISH:** Apply professional color correction and lighting to match the selected mood: "${input.moodSelected}". Ensure the final composition is photo-realistic and visually appealing.
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

    return { enhancedPhotoDataUri: media.url };
  }
);
