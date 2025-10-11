
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

export type Feature = {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  creditCost: number;
  action: (...args: any[]) => Promise<any>;
  showBeforeAfterSlider: boolean;
  category: string;
  outputType: 'image' | 'text';
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

// Types for Magic Interior
export const MagicInteriorInputSchema = z.object({
    photoDataUri: z.string().describe("User's interior photo as a data URI."),
    roomType: z.string(),
    styleSelected: z.string(),
    options: z.object({
        colorPalette: z.string(),
    }),
});
export type MagicInteriorInput = z.infer<typeof MagicInteriorInputSchema>;

export const MagicInteriorOutputSchema = z.object({
    redesignedPhotoDataUri: z.string().describe("The generated redesigned interior photo as a data URI."),
});
export type MagicInteriorOutput = z.infer<typeof MagicInteriorOutputSchema>;


// Types for Recreate Childhood Place
export const RecreateChildhoodInputSchema = z.object({
    photoDataUri: z.string().optional().describe("User's old photo as a data URI."),
    memoryText: z.string().optional().describe("A short text description of the memory."),
    inputType: z.enum(["photo", "text", "photo+text"]),
    placeType: z.string(),
    style: z.string(),
    intensity: z.enum(["mild", "normal", "high"]),
});
export type RecreateChildhoodInput = z.infer<typeof RecreateChildhoodInputSchema>;

export const RecreateChildhoodOutputSchema = z.object({
    modernizedPhotoDataUri: z.string().describe("The generated modernized scene as a data URI."),
});
export type RecreateChildhoodOutput = z.infer<typeof RecreateChildhoodOutputSchema>;
