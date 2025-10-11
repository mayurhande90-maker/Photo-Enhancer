
'use server';

/**
 * @fileOverview Redesigns the interior of a user's room based on a selected style.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MagicInteriorInputSchema, MagicInteriorOutputSchema, MagicInteriorInput } from '@/lib/types';

export async function createMagicInterior(input: MagicInteriorInput): Promise<z.infer<typeof MagicInteriorOutputSchema>> {
  return magicInteriorFlow(input);
}


const magicInteriorFlow = ai.defineFlow(
  {
    name: 'magicInteriorFlow',
    inputSchema: MagicInteriorInputSchema,
    outputSchema: MagicInteriorOutputSchema,
    
  },
  async (input) => {
    // Returning empty data to disable image generation.
    return { redesignedPhotoDataUri: '' };
  }
);
