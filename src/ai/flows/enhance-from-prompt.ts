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
      'A photo to enhance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'  ),
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

const prompt = ai.definePrompt({
  name: 'enhanceFromPromptPrompt',
  input: {schema: EnhanceFromPromptInputSchema},
  output: {schema: EnhanceFromPromptOutputSchema},
  prompt: `You are an expert photo enhancer. Enhance the provided photo based on the following user instructions: {{{enhancementPrompt}}}. Preserve faces and body shapes unchanged.

Original Photo: {{media url=photoDataUri}}`,
});

const enhanceFromPromptFlow = ai.defineFlow(
  {
    name: 'enhanceFromPromptFlow',
    inputSchema: EnhanceFromPromptInputSchema,
    outputSchema: EnhanceFromPromptOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `enhance this photo according to the following instructions: ${input.enhancementPrompt}`},
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {enhancedPhotoDataUri: media.url!};
  }
);
