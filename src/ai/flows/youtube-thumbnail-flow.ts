
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
  },
  async (input) => {
    const prompt = `
      Create a cinematic, scroll-stopping YouTube thumbnail with a strict 16:9 aspect ratio (1280x720 resolution).

      Inputs:
      - Category: ${input.categorySelected}
      - Mood: ${input.moodSelected}
      - Subject Alignment: ${input.alignmentSelected}
      - Video Type: ${input.videoType}
      - Subject Image: {{media url=${input.photoDataUri}}}

      Key Instructions:
      1.  **Subject:** Use the provided image. Remove the background, make the subject prominent (40-60% of frame), and align it to ${input.alignmentSelected}.
      2.  **Background:** Create a dynamic, blurred background related to the category: "${input.categorySelected}". Match the lighting and mood: "${input.moodSelected}".
      3.  **Text:** Generate a catchy, relevant hook line based on the video type: "${input.videoType}". Place it opposite the subject for balance using bold, readable typography.
      4.  **Finish:** Apply color correction for the selected mood. Ensure the entire composition is photo-realistic and integrated.

      Output Requirements: 16:9 aspect ratio, 1280x720 resolution, JPG format, photo-realistic style.
      Negative prompt: flat, dull, unrealistic lighting, poor alignment, unreadable text, distorted, cutout look.
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
