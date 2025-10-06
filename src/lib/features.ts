
import {
  enhancePhotoAction,
  removeBackgroundAction,
  studioEnhanceAction,
  colorizePhotoAction,
} from '@/app/actions';
import type { Feature } from '@/lib/types';
import { Wand2, Scissors, Camera, Palette } from 'lucide-react';

export const features: Feature[] = [
  {
    name: 'Photo Enhancement',
    description: 'Fix lighting, colors, noise, and resolution.',
    path: '/dashboard/enhance',
    icon: Wand2,
    creditCost: 1,
    action: enhancePhotoAction,
    showBeforeAfterSlider: true,
  },
  {
    name: 'Background Removal',
    description: 'Get a transparent PNG with clean edges.',
    path: '/dashboard/background-removal',
    icon: Scissors,
    creditCost: 1,
    action: removeBackgroundAction,
    showBeforeAfterSlider: false,
  },
  {
    name: 'Photo Studio',
    description: 'Create e-commerce ready product shots.',
    path: '/dashboard/studio',
    icon: Camera,
    creditCost: 3,
    action: studioEnhanceAction,
    showBeforeAfterSlider: false,
  },
  {
    name: 'Photo Colorize',
    description: 'Bring old black and white photos to life.',
    path: '/dashboard/colorize',
    icon: Palette,
    creditCost: 1,
    action: colorizePhotoAction,
    showBeforeAfterSlider: true,
  },
];

    