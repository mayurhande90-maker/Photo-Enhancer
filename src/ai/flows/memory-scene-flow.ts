
'use server';

/**
 * @fileOverview Creates a visual scene from a user's memory (photo or text).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MemorySceneInputSchema, MemorySceneOutputSchema, MemorySceneInput } from '@/lib/types';

export async function createMemoryScene(input: MemorySceneInput): Promise<z.infer<typeof MemorySceneOutputSchema>> {
  return memorySceneFlow(input);
}

const memorySceneFlow = ai.defineFlow(
  {
    name: 'memorySceneFlow',
    inputSchema: MemorySceneInputSchema,
    outputSchema: MemorySceneOutputSchema,
    retries: 2,
  },
  async (input) => {
    // A more concise prompt to prevent token limit errors.
    const prompt = `
      You are an image restoration and generation model. Preserve identity from any reference photo.
      Mode: ${input.mode}
      ${input.memoryText ? `Memory text: "${input.memoryText}"` : ''}
      Era: ${input.eraHint}
      Style: ${input.style}

      Task:
      1.  If a reference photo is provided, PRESERVE the subject's facial structure and identity. DO NOT alter bone structure or ethnicity.
      2.  Based on the mode:
          - restore: Clean damage, extend background naturally.
          - recreate: Generate a scene matching the memory text and era.
          - stylize: Apply the visual style to the photo, keeping identity.
      3.  Match lighting, perspective, and shadows for seamless integration.
      4.  Output one high-quality, photo-realistic image.
      
      Negative prompt: NO face-swapping, no changing bone structure, no copyrighted logos, no nudity, no caricature.
    `;

    const { media } = await ai.generate({
      prompt: input.photoDataUri 
        ? [ { media: { url: input.photoDataUri } }, { text: prompt } ]
        : prompt,
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
