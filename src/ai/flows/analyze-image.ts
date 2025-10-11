
'use server';

import { ai } from '@/ai/genkit';
import { AnalyzeImageInput, AnalyzeImageOutput, AnalyzeImageInputSchema, AnalyzeImageOutputSchema } from '@/lib/types';


export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async (input) => {
    // Feature disabled: returning placeholder analysis.
    return { analysis: "Image analysis is currently disabled." };
  }
);
