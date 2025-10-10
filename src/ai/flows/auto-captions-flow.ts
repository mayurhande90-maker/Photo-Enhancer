
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
    AutoCaptionInput,
    AutoCaptionInputSchema,
    AutoCaptionOutput,
    AutoCaptionOutputSchema
} from '@/lib/types';


export async function generateCaptions(input: AutoCaptionInput): Promise<AutoCaptionOutput> {
  return autoCaptionsFlow(input);
}

const captionGenerationPrompt = `
You are a professional social media strategist and caption writer.  
You will receive an uploaded image. First, perform a detailed visual analysis of this photo before generating any caption or hashtags.

Analyze the following:
1. Main subject(s) — what or who is in the photo.  
2. Objects, background, environment, and setting.  
3. Any visible text or product logos.  
4. Emotions, color palette, and lighting tone.  
5. Overall theme — for example: travel, tech, fashion, food, podcast, fitness, education, event, nature, etc.  
6. Scene composition — indoor, outdoor, studio, natural light, crowd, etc.

After the visual analysis:
- Write **3 caption options** (Short, Medium, Long).  
  - The short caption should be punchy and expressive (ideal for Reels or YouTube Shorts).  
  - The medium caption should tell a short story or context (Instagram posts).  
  - The long caption should include context + a strong CTA line (LinkedIn or Facebook).  

- Generate **hashtags** that are:
  - 100% relevant to what’s visible in the photo.
  - Trending, clean, and ad-safe.
  - Include both broad and niche tags.
  - Format hashtags clearly — separated by spaces, with line breaks if needed.

- Maintain a professional layout and readability:
  - Add line breaks, spacing, and emojis only where contextually natural.
  - Captions should feel real and human — no robotic tone.
  - Avoid generic filler lines like “A beautiful day!” unless contextually correct.

Output must be **ready to post** directly on platforms like Instagram, YouTube Community, or Facebook.

-----------------------------------------
FORMAT THE OUTPUT EXACTLY LIKE THIS:
-----------------------------------------

🪶 **Caption (Short):**
<short caption text>

💬 **Caption (Medium):**
<medium caption text>

📝 **Caption (Long):**
<long caption text>

🏷️ **Hashtags (Recommended):**
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 ...

⚙️ **Auto Notes:**
<one-line explanation of what the image contains>

-----------------------------------------
ADDITIONAL INSTRUCTIONS
-----------------------------------------
- The captions must sound human and contextual to the image.
- If the image contains a person, describe the vibe or emotion — never identify who they are.
- If it’s a product or object, mention features or purpose naturally.
- If it’s travel/nature — highlight place, vibe, and mood.
- If text is detected on image, use that to understand theme (e.g., “Podcast” or “Full Episode”).
- Use relevant emojis only when it fits the tone.
- Do not overuse hashtags (15–20 max).
- Do not include any banned or misleading hashtags.
- The final output should look balanced and properly spaced for direct posting.
`;

const autoCaptionsFlow = ai.defineFlow(
  {
    name: 'autoCaptionsFlow',
    inputSchema: AutoCaptionInputSchema,
    outputSchema: AutoCaptionOutputSchema,
    
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: captionGenerationPrompt },
      ],
      model: 'googleai/gemini-2.5-flash',
      context: {
        platform: input.platform,
        tone: input.tone,
        goal: input.goal,
        language: input.language,
      }
    });

    if (!text) {
      throw new Error('Caption generation failed.');
    }

    return text;
  }
);
