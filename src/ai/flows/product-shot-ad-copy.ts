'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating ad copy for product photos enhanced using the Photo Studio feature.
 *
 * - generateAdCopy - A function that generates ad copy for a product photo.
 * - GenerateAdCopyInput - The input type for the generateAdCopy function.
 * - GenerateAdCopyOutput - The return type for the generateAdCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdCopyInputSchema = z.object({
  productPhotoDataUri: z
    .string()
    .describe(
      "A product photo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productType: z.string().describe('The type of product in the photo.'),
  brandName: z.string().describe('The brand name of the product.'),
});
export type GenerateAdCopyInput = z.infer<typeof GenerateAdCopyInputSchema>;

const GenerateAdCopyOutputSchema = z.object({
  adCopy: z.string().describe('Generated ad copy for the product photo.'),
});
export type GenerateAdCopyOutput = z.infer<typeof GenerateAdCopyOutputSchema>;

export async function generateAdCopy(input: GenerateAdCopyInput): Promise<GenerateAdCopyOutput> {
  return generateAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdCopyPrompt',
  input: {schema: GenerateAdCopyInputSchema},
  output: {schema: GenerateAdCopyOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in e-commerce product descriptions.

  Given a product photo, its type, and brand name, generate compelling ad copy.
  The ad copy should be concise, engaging, and optimized for social media and e-commerce platforms.

  Product Type: {{{productType}}}
  Brand Name: {{{brandName}}}
  Product Photo: {{media url=productPhotoDataUri}}

  Ad Copy:
`,
});

const generateAdCopyFlow = ai.defineFlow(
  {
    name: 'generateAdCopyFlow',
    inputSchema: GenerateAdCopyInputSchema,
    outputSchema: GenerateAdCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
