
'use server';

/**
 * @fileOverview Generates a hyper-realistic photo of a user with a celebrity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CelebrityPictureInputSchema = z.object({
  userPhotoDataUri: z
    .string()
    .describe(
      'A high-resolution, front-facing photo of the user, as a data URI.'
    ),
  celebrityName: z.string().describe('The name of the selected celebrity.'),
  locationName: z.string().describe('The name of the selected background/location.'),
});
export type CelebrityPictureInput = z.infer<typeof CelebrityPictureInputSchema>;

const CelebrityPictureOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The generated photo of the user with the celebrity, as a data URI.'),
});
export type CelebrityPictureOutput = z.infer<typeof CelebrityPictureOutputSchema>;

export async function pictureWithCelebrity(input: CelebrityPictureInput): Promise<CelebrityPictureOutput> {
  return celebrityPictureFlow(input);
}

const celebrityPictureFlow = ai.defineFlow(
  {
    name: 'celebrityPictureFlow',
    inputSchema: CelebrityPictureInputSchema,
    outputSchema: CelebrityPictureOutputSchema,
  },
  async (input) => {
    let prompt: string;

    if (input.celebrityName === 'Salman Khan') {
      prompt = `
        You are a world-class expert in photorealistic image synthesis. Your task is to create a new, authentic, and natural-looking **candid photograph** featuring two people: a user (provided as an image) and the celebrity **Salman Khan**, placed seamlessly within a specified location.

        **CRITICAL DIRECTIVES - Adherence is mandatory:**
        1.  **SHOT TYPE:** The final image **MUST** be a **candid mid-shot**. Both the user and Salman Khan should appear natural, as if caught in a real-life moment. They should both be looking generally towards the camera, but not in a perfectly posed way.
        2.  **SALMAN KHAN IDENTITY LOCK (HIGHEST PRIORITY):**
            *   You **MUST** perfectly preserve the real facial and physical identity of **Salman Khan**. The likeness must be 100% accurate and unmistakable.
            *   **Face:** Keep his **square face shape, strong broad jawline, prominent chin, and medium tan skin tone** exactly as they appear in real life.
            *   **Eyes:** Replicate his **almond-shaped, hazel-brown eyes** and thick, naturally arched eyebrows.
            *   **Nose & Mouth:** Maintain his **straight-bridged nose** and medium lips with a characteristically subtle smirk.
            *   **Hair:** His hair must be **natural black, short, and neatly styled with volume on top**.
            *   **Build:** He has a **muscular, mesomorphic build with broad shoulders**. This must be accurately represented.
            *   **Do NOT stylize, exaggerate, or alter any of his features.** The result must look like an authentic photograph of the real Salman Khan.
        3.  **USER IDENTITY PRESERVATION:**
            *   Do **NOT** alter the facial features, body structure, or distinct characteristics of the user from the provided photo. Their identity must be perfectly preserved.
        4.  **SEAMLESS & NATURAL INTEGRATION:**
            *   Blend the user and Salman Khan seamlessly into the chosen location: "${input.locationName}".
            *   The interaction should look natural and unposed.
            -   **Clothing:** Adapt their clothing to be appropriate and natural for the location (e.g., casual for a beach, formal for a red carpet).
        5.  **PHOTOGRAPHIC REALISM:**
            *   **Lighting & Shadows:** Apply realistic, directional lighting and soft shadows to both individuals that perfectly match the environment of "${input.locationName}".
            *   **Texture:** The final image must look like a real photograph, not a digital painting or AI composite. Apply a subtle, natural filmic grain to enhance authenticity.
        6.  **WATERMARK:** Add a small, discreet watermark in the bottom-right corner that says 'Magicpixa'.

        **INPUTS:**
        *   User's Photo: {{media url=userPhotoDataUri}}
        *   Celebrity: Salman Khan
        *   Location: ${input.locationName}

        Generate a single, hyper-realistic 512x512 image based on these strict instructions.
      `;
    } else if (input.celebrityName === 'Deepika Padukone') {
      prompt = `
        You are a world-class expert in photorealistic image synthesis. Your task is to create a new, authentic, and natural-looking **candid photograph** featuring two people: a user (provided as an image) and the celebrity **Deepika Padukone**, placed seamlessly within a specified location.

        **CRITICAL DIRECTIVES - Adherence is mandatory:**
        1.  **SHOT TYPE:** The final image **MUST** be a **candid mid-shot**. Both the user and Deepika Padukone should appear natural, as if caught in a real-life moment, looking generally towards the camera.
        2.  **IDENTITY PRESERVATION (IMAGE-REFERENCE ONLY):**
            *   You **MUST** use the provided reference images of Deepika Padukone to ensure the generated picture represents the real celebrity without distortion or misrepresentation.
            *   **Do NOT infer, fabricate, or describe her physical features textually.** Her appearance must be consistent with the reference photos.
            *   The user's identity from their uploaded photo must also be perfectly preserved without any alteration.
        3.  **SEAMLESS & NATURAL INTEGRATION:**
            *   Blend the user and Deepika Padukone seamlessly into the chosen location: "${input.locationName}".
            *   The interaction should look natural and unposed.
            *   Match the lighting, shadows, and reflections of the environment perfectly.
            *   Keep proportions natural and maintain professional-photo realism.
        4.  **PHOTOGRAPHIC REALISM:**
            *   The final image must look like a real photograph with realistic sharpness and skin texture.
            *   Apply a subtle, natural filmic grain to enhance authenticity.
        5.  **WATERMARK:** Add a small, discreet watermark in the bottom-right corner that says 'Magicpixa'.

        **INPUTS:**
        *   User's Photo: {{media url=userPhotoDataUri}}
        *   Celebrity: Deepika Padukone
        *   Location: ${input.locationName}

        Generate a single, hyper-realistic 512x512 image based on these strict, image-reference-driven instructions.
      `;
    } else {
      // Generic prompt for other celebrities
      prompt = `
        You are a world-class expert in photorealistic image synthesis. Your task is to create a new, authentic, and natural-looking **candid photograph** featuring two people: a user (provided as an image) and a celebrity, placed seamlessly within a specified location.

        **CRITICAL DIRECTIVES - Adherence is mandatory:**
        1.  **SHOT TYPE:** The final image **MUST** be a **candid mid-shot**. Both the user and the celebrity should appear natural, as if caught in a real-life moment. They should both be looking generally towards the camera, but not in a perfectly posed way.
        2.  **IDENTITY PRESERVATION (HIGHEST PRIORITY):**
            *   **User:** Do NOT alter the facial features, body structure, or distinct characteristics of the user from the provided photo. Their identity must be perfectly preserved.
            *   **Celebrity:** The celebrity, **${input.celebrityName}**, **MUST** look exactly like their real-world self. Do not alter their facial features or body structure in any way. The likeness must be unmistakable.
        3.  **SEAMLESS & NATURAL INTEGRATION:**
            *   Blend the user and the celebrity (${input.celebrityName}) seamlessly into the chosen location: "${input.locationName}".
            *   The interaction should look natural and unposed.
        4.  **PHOTOGRAPHIC REALISM:**
            *   **Lighting & Shadows:** Apply realistic, directional lighting and soft shadows to both individuals that perfectly match the environment of "${input.locationName}".
            *   **Clothing:** Adapt their clothing to be appropriate and natural for the location (e.g., casual for a beach, formal for a red carpet).
            *   **Scale & Perspective:** Ensure both figures are proportionate to each other and the background, maintaining correct perspective.
            *   **Texture:** The final image must look like a real photograph, not a digital painting or AI composite. Apply a subtle, natural filmic grain to enhance authenticity.
        5.  **WATERMARK:** Add a small, discreet watermark in the bottom-right corner that says 'Magicpixa'.

        **INPUTS:**
        *   User's Photo: {{media url=userPhotoDataUri}}
        *   Celebrity: ${input.celebrityName}
        *   Location: ${input.locationName}

        Generate a single, hyper-realistic 512x512 image based on these strict instructions.
      `;
    }

    const { media } = await ai.generate({
      prompt: [
        { media: { url: input.userPhotoDataUri } },
        { text: prompt },
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a result.');
    }

    return { enhancedPhotoDataUri: media.url };
  }
);

    