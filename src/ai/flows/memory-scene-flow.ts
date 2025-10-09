
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
    const prompt = `
      System instruction:
      "You are a professional image-restoration and scene-generation model. Preserve identity and face geometry for any provided reference photos. Never produce pornographic, hateful, or illegal content. If the input appears to include minors (<18) or public figures, abort and return the appropriate error code."

      User instruction (dynamic):
      "Mode: ${input.mode}
      ${input.photoDataUri ? `Reference image: {{media url=${input.photoDataUri}}}` : ''}
      ${input.memoryText ? `Memory text: \\"${input.memoryText}\\"` : ''}
      Era hint: ${input.eraHint}
      Style: ${input.style}
      Options: weather=Clear, crowd=Few, intensity=Moderate

      Task:
      1) If a reference photo is provided — preserve the subject's facial structure, skin tone, and identifying marks; do not alter bone structure or ethnicity.
      2) Based on the mode:
        - restore: remove damage, extend background naturally to match original scene and era.
        - recreate: generate a plausible scene that matches the memory text and era hint.
        - stylize: apply the selected visual style to the original photo while preserving identity.
      3) Add or modify background elements consistent with era and place (vehicles, clothing, signage), but do not add identifiable brands or logos unless present in original.
      4) Respect lighting and perspective; match shadows, light angle, and depth-of-field to ensure seamless integration.
      5) Provide one high-quality, photo-realistic image.
      
      Negative prompt:
      "no face-swapping, no changing fundamental bone structure, no adding copyrighted logos, no nudity, no extreme caricature, no textual watermarks within the face area."
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

    