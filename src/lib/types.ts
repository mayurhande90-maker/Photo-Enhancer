
import type { LucideIcon } from 'lucide-react';

export type Feature = {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  creditCost: number;
  action: (photoDataUri: string, userId: string) => Promise<{ enhancedPhotoDataUri: string }>;
  showBeforeAfterSlider: boolean;
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  credits: number;
  planName: 'Guest' | 'Pro';
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
