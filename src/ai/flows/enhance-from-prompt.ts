
'use server';

/**
 * @fileOverview Enhances a photo based on a user-provided prompt.
 *
 * - enhanceFromPrompt - A function that enhances a photo based on a user-provided prompt.
 * - EnhanceFromPromptInput - The input type for the enhanceFromPrompt function.
 * - EnhanceFromPromptOutput - The return type for the enhanceFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceFromPromptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A URL to a photo to enhance.'
    ),
  enhancementPrompt: z.string().describe('A prompt describing the desired enhancements.'),
});
export type EnhanceFromPromptInput = z.infer<typeof EnhanceFromPromptInputSchema>;

const EnhanceFromPromptOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The enhanced photo, as a data URI.'),
});
export type EnhanceFromPromptOutput = z.infer<typeof EnhanceFromPromptOutputSchema>;

export async function enhanceFromPrompt(input: EnhanceFromPromptInput): Promise<EnhanceFromPromptOutput> {
  return enhanceFromPromptFlow(input);
}

const enhanceFromPromptFlow = ai.defineFlow(
  {
    name: 'enhanceFromPromptFlow',
    inputSchema: EnhanceFromPromptInputSchema,
    outputSchema: EnhanceFromPromptOutputSchema,
    
  },
  async input => {
    let prompt = input.enhancementPrompt;
    if (typeof prompt !== "string") {
      prompt = JSON.stringify(prompt);
    }
    if (prompt.length > 500) {
      prompt = prompt.slice(0, 500);
    }
    const safePrompt = prompt.replace(/[^\w\s.,!?-]/g, "");

    const {media} = await ai.generate({
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: safePrompt},
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a result.');
    }

    return {enhancedPhotoDataUri: media.url};
  }
);
