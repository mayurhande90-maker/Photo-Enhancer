
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
    const { output } = await ai.generate({
      prompt: [
        {
          text: `You are an encouraging photo assistant. Analyze the following image and provide a very short (one-sentence) friendly and encouraging caption for the user. Examples: "Nice portrait! Let’s bring out those natural details." or "Beautiful view! Let’s enhance those colors." or "Clean product shot detected. Ready for a cinematic touch?". Do not mention that you are an AI.`,
        },
        { media: { url: input.photoDataUri } },
      ],
      output: {
        format: 'json',
        schema: AnalyzeImageOutputSchema,
      },
      model: 'googleai/gemini-2.5-flash',
    });

    return output!;
  }
);
