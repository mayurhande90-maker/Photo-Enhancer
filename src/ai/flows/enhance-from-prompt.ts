
'use server';

/**
 * @fileOverview Enhances a photo based on a user-provided prompt.
 * THIS FEATURE IS DISABLED.
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
    // Feature disabled: returning empty data.
    return {enhancedPhotoDataUri: ''};
  }
);
