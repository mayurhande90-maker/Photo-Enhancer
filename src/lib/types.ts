
import type { LucideIcon } from 'lucide-react';

export type Feature = {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  creditCost: number;
  action: (photoDataUri: string) => Promise<{ enhancedPhotoDataUri: string }>;
  showBeforeAfterSlider: boolean;
};

// User-related types are no longer needed
