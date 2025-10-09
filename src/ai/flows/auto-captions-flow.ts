
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
    AutoCaptionImageAnalysis,
    AutoCaptionImageAnalysisSchema,
    AutoCaptionInput,
    AutoCaptionInputSchema,
    AutoCaptionOutput,
    AutoCaptionOutputSchema
} from '@/lib/types';


export async function generateCaptions(input: AutoCaptionInput): Promise<AutoCaptionOutput> {
  return autoCaptionsFlow(input);
}


const captionGenerationPrompt = `
System instruction:
"You are a professional social media copywriter and content strategist. Your first task is to meticulously analyze the provided image. After analysis, you will output a structured JSON object containing production-ready social captions and optimized hashtag groups. Always follow safety rules: never identify or name people in the image, never invent personal data or claims. Keep text ad-friendly and policy-compliant. Ensure spacing, line breaks and punctuation are formatted for direct posting."

Image to Analyze: {{media url=photoDataUri}}

User Preferences:
{
  "platform": "{{platform}}",
  "tone": "{{tone}}",
  "goal": "{{goal}}",
  "language": "{{language}}"
}

Generation instructions:
"Task:
1) Based directly on the visual information in the image provided, produce:
   - Three caption variations (short, mid, long). Each caption must be coherent, emotionally resonant, platform-appropriate, and inline with the chosen tone and goal.
   - A suggested CTA for each caption (e.g., 'Link in bio', 'Watch full video', 'Comment your thoughts', 'Tap to shop').
2) Generate hashtag groups:
   - primary: 3–5 high-impact, relevant hashtags
   - secondary: 8–15 supporting hashtags (mix of broad + niche)
   - firstComment: a ready-to-paste first comment block that contains 10–25 hashtags optimized for reach (space-separated OR newline separated). Make sure hashtags are relevant and not banned.
3) Provide alt_text (one-liner, 125 characters max) and seo_description (short paragraph 150–200 chars).
4) Ensure final caption is ad-friendly: no hateful, sexual, defamatory, or shockbait claims. If image indicates potentially sensitive topics, produce a safe, neutral caption and flag for human review (include "needs_manual_review": true).
5) Check formatting:
   - Provide captions with explicit line breaks where needed.
   - Provide emoji suggestions inline where appropriate (no emoji abuse).
   - Ensure readability: short sentences, clear spacing, no long unbroken lines.
6) Output must be a single JSON object exactly in this schema (so it can be parsed by the frontend):

{
  "caption_short": "<string>",
  "caption_mid": "<string>",
  "caption_long": "<string>",
  "cta_short": "<string>",
  "cta_mid": "<string>",
  "cta_long": "<string>",
  "hashtags": {
    "primary": ["#tag1", "#tag2", "#tag3"],
    "secondary": ["#tag4", "#tag5", ...],
    "firstComment": "#tag1 #tag2 #tag3 ... (10-25 hashtags as second comment)"
  },
  "alt_text": "<string up to 125 chars>",
  "seo_description": "<150-200 char paragraph>",
  "emoji_suggestions": ["😊","🔥"],
  "needs_manual_review": false,
  "safety_notes": "<if any, otherwise empty>"
}

Rules:
- Do not include any newline or extraneous text outside the JSON.
- Never guess or identify people in the image. Use neutral phrasings like 'a person' or 'two people'.
- Do not produce hashtags that are banned or obviously spammy (e.g., excessive repeated tags).
- Prioritize relevance over generic reach. Use mix of top-level tags (#travel) and niche tags (#GoaHiddenBeaches).
- For platform Instagram — keep mid caption to <= 2200 characters and suggest firstComment as hashtags (if user selected 'first comment').
- For X/Twitter — produce short caption <= 280 chars and fewer hashtags (1–3).
- For LinkedIn — produce professional tone and avoid emoji or casual slang (unless toneSelected requests otherwise).
- For each caption include one clear CTA line at end.
- If the input image contains product(s), generate product phrases and include shopping-related hashtags if the goal includes 'Promote Product'.
- If the model detects potential copyright/logo in image, warn in "safety_notes" and set "needs_manual_review": true.
"
`;


const autoCaptionsFlow = ai.defineFlow(
  {
    name: 'autoCaptionsFlow',
    inputSchema: AutoCaptionInputSchema,
    outputSchema: AutoCaptionOutputSchema,
    retries: 2,
  },
  async (input) => {
    // Combined single-step flow: analyze image and generate captions together
    const { output } = await ai.generate({
      prompt: captionGenerationPrompt,
      model: 'googleai/gemini-2.5-flash',
      output: {
          format: 'json',
          schema: AutoCaptionOutputSchema,
      },
      context: {
        photoDataUri: input.photoDataUri,
        platform: input.platform,
        tone: input.tone,
        goal: input.goal,
        language: input.language,
      }
    });

    if (!output) {
      throw new Error('Caption generation failed.');
    }

    return output;
  }
);
