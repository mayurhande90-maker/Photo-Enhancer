import type { LucideIcon } from 'lucide-react';
import type { User } from 'firebase/auth';

export type Feature = {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  creditCost: number;
  action: (photoDataUri: string, userId: string) => Promise<{ enhancedPhotoDataUri: string }>;
  showBeforeAfterSlider: boolean;
};

export type UserProfile = {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    credits: number;
    planName: string;
}

export type GeneratedImage = {
    id: string;
    userId: string;
    originalImageUrl: string;
    processedImageUrl: string;
    processingType: string;
    generationTimestamp: {
        seconds: number;
        nanoseconds: number;
    };
}
