
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/product-shot-ad-copy.ts';
import '@/ai/flows/enhance-from-prompt.ts';
import '@/ai/flows/analyze-image.ts';
import '@/ai/flows/celebrity-picture.ts';
import '@/ai/flows/colorize-photo.ts';
import '@/ai/flows/youtube-thumbnail-flow.ts';
import '@/ai/flows/auto-captions-flow.ts';
import '@/ai/flows/ai-future-self-flow.ts';
import '@/ai/flows/magic-interior-flow.ts';
import '@/ai/flows/recreate-childhood-flow.ts';
