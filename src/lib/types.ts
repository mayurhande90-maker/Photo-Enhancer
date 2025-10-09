
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export type Feature = {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  creditCost: number;
  action: (photoDataUri: string, userId: string, ...args: any[]) => Promise<any>;
  showBeforeAfterSlider: boolean;
  category: string;
  isPremium?: boolean;
  isComingSoon?: boolean;
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  credits: number;
  planName: 'Free' | 'Pro' | 'Premium+';
  createdAt: any; // Firestore ServerTimestamp
}

export interface GeneratedImage {
    id: string;
    userId: string;
    originalImageUrl: string;
    processedImageUrl: string;
    processingType: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

export const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

export const AnalyzeImageOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'A very short, one-sentence, friendly, and encouraging caption for the user based on the image content. Start with a positive observation.'
    ),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

// Types for Auto Captions feature
export const AutoCaptionInputSchema = z.object({
  photoDataUri: z.string().describe("The user-uploaded image as a data URI."),
  platform: z.string(),
  tone: z.string(),
  goal: z.string(),
  language: z.string().default('en'),
});
export type AutoCaptionInput = z.infer<typeof AutoCaptionInputSchema>;


export const AutoCaptionOutputSchema = z.string().describe("The formatted string containing captions, hashtags, and notes.");
export type AutoCaptionOutput = z.infer<typeof AutoCaptionOutputSchema>;


// Types for AI Future Self
export const AIFutureSelfInputSchema = z.object({
    photoDataUri: z.string().describe("User's photo as a data URI."),
    ageGap: z.number().describe("Number of years to age the person."),
});
export type AIFutureSelfInput = z.infer<typeof AIFutureSelfInputSchema>;

export const AIFutureSelfOutputSchema = z.object({
    agedPhotoDataUri: z.string().describe("The generated aged photo as a data URI."),
});
export type AIFutureSelfOutput = z.infer<typeof AIFutureSelfOutputSchema>;

// Types for Memory Scene
export const MemorySceneInputSchema = z.object({
    photoDataUri: z.string().optional().describe("User's photo as a data URI."),
    memoryText: z.string().optional().describe("A short text description of a memory."),
    mode: z.string().describe("The generation mode: Restore, Recreate, or Stylize."),
    eraHint: z.string().describe("The historical era to replicate."),
    style: z.string().describe("The visual style for the output."),
});
export type MemorySceneInput = z.infer<typeof MemorySceneInputSchema>;

export const MemorySceneOutputSchema = z.object({
    enhancedPhotoDataUri: z.string().describe("The generated scene as a data URI."),
});
export type MemorySceneOutput = z.infer<typeof MemorySceneOutputSchema>;

    