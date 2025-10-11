
'use server';

/**
 * @fileOverview Generates a photo-realistic aged version of a user's photo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AIFutureSelfInputSchema, AIFutureSelfOutputSchema } from '@/lib/types';


export async function generateFutureSelf(input: z.infer<typeof AIFutureSelfInputSchema>): Promise<z.infer<typeof AIFutureSelfOutputSchema>> {
  return aiFutureSelfFlow(input);
}


const aiFutureSelfFlow = ai.defineFlow(
  {
    name: 'aiFutureSelfFlow',
    inputSchema: AIFutureSelfInputSchema,
    outputSchema: AIFutureSelfOutputSchema,
    
  },
  async (input) => {
    // Returning empty data to disable image generation.
    return { agedPhotoDataUri: '' };
  }
);
