
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
export const AutoCaptionImageAnalysisSchema = z.object({
    objects: z.array(z.string()).describe("List of detected objects in the image."),
    scene: z.string().describe("The overall scene or setting of the image."),
    people_present: z.boolean().describe("Whether people are present in the image."),
    colors: z.array(z.string()).describe("Dominant colors in the image."),
    detected_text: z.string().optional().describe("Any text found in the image."),
});
export type AutoCaptionImageAnalysis = z.infer<typeof AutoCaptionImageAnalysisSchema>;


export const AutoCaptionInputSchema = z.object({
  photoDataUri: z.string().describe("The user-uploaded image as a data URI."),
  platform: z.string(),
  tone: z.string(),
  goal: z.string(),
  language: z.string().default('en'),
});
export type AutoCaptionInput = z.infer<typeof AutoCaptionInputSchema>;


export const AutoCaptionOutputSchema = z.object({
  caption_short: z.string(),
  caption_mid: z.string(),
  caption_long: z.string(),
  cta_short: z.string(),
  cta_mid: z.string(),
  cta_long: z.string(),
  hashtags: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
    firstComment: z.string(),
  }),
  alt_text: z.string(),
  seo_description: z.string(),
  emoji_suggestions: z.array(z.string()),
  needs_manual_review: z.boolean(),
  safety_notes: z.string(),
});
export type AutoCaptionOutput = z.infer<typeof AutoCaptionOutputSchema>;
