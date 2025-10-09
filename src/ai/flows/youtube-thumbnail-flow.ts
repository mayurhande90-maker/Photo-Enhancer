
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
      Create a cinematic, scroll-stopping YouTube thumbnail at 1280x720 resolution.

      Inputs:
      Category: ${input.categorySelected}
      Mood: ${input.moodSelected}
      Subject Alignment: ${input.alignmentSelected}
      Video Type: ${input.videoType}

      Step 1 — Subject Enhancement:
      Generate a main subject based on the Video Type. For instance, if the video type is 'Phone unboxing', the subject could be a person looking excited at a new phone.
      The subject should appear prominent, close, and engaging within the frame — as if shot with a professional camera at shallow depth.
      The subject should occupy roughly 40–60% of the frame.
      Reposition the subject to the ${input.alignmentSelected} area:
      - Left Alignment → subject on left one-third of frame, facing inward if possible.
      - Right Alignment → subject on right one-third of frame, facing inward if possible.
      - Center Alignment → subject in middle, large and dominant.

      Step 2 — Composition & Background:
      Create a dynamic, depth-based background related to the selected category (${input.categorySelected}) and video type (${input.videoType}).
      Blend the background naturally with correct perspective, blur depth, and realistic lighting.
      Ensure the background complements the mood (${input.moodSelected}):
      - Dramatic: darker gradient, strong contrast light.
      - Fun: bright, saturated backdrop with playful tones.
      - Cinematic: soft contrast, moody hues.
      - Vlog Styled: warm, daylight tone.
      - Clean: minimal blurred gradient with brand tone.

      Step 3 — Text & Hook Line:
      Generate a catchy, relevant hook line based on ${input.videoType} and ${input.categorySelected}.
      Example:
        - Travel: “Exploring the Unseen 🌍”
        - Tech: “This Gadget Changed Everything ⚡”
        - Lifestyle: “A Day You Won’t Forget”
        - Podcast: “The Conversation That Matters”
        - Gaming: “You Won’t Believe This Moment!”

      Place the text compositionally opposite to the subject alignment:
      - If subject is on left → text on right.
      - If subject is on right → text on left.
      - If centered → text above or below subject.
      Use bold, readable typography with clear contrast and subtle shadow.
      Do NOT overlap key facial features.

      Step 4 — Lighting & Finishing:
      Match lighting between subject and background for realism.
      Add soft glow behind subject (light wrap) for natural blend.
      Apply color correction consistent with ${input.moodSelected}.
      Enhance eyes, contrast, and clarity subtly for camera-like finish.
      Ensure entire composition feels integrated and photo-realistic, not pasted.

      Output Requirements:
      - Style: photo-realistic, cinematic
      - Format: JPG (under 1.5MB)

      Negative prompt:
      "flat subject, unrealistic lighting, random background, small subject, poor alignment, dull colors, unreadable text, distorted proportions, cutout look."
    `;

    const { media } = await ai.generate({
      prompt: prompt,
      model: 'googleai/imagen-4.0-fast-generate-001',
      config: {
        aspectRatio: '16:9'
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a result.');
    }

    return { enhancedPhotoDataUri: media.url };
  }
);
