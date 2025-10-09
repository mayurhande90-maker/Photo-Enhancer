
'use server';

/**
 * @fileOverview Redesigns the interior of a user's room based on a selected style.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MagicInteriorInputSchema, MagicInteriorOutputSchema, MagicInteriorInput } from '@/lib/types';

const styleDescriptions: Record<string, string> = {
    'Japanese': 'Incorporate traditional and modern Japanese interior aesthetics: minimalism, tatami mats, shōji sliding panels, natural wood finishes (light warm wood tones), clean lines, low-profile furniture, hidden storage, soft diffused natural light. Use neutral and muted color palette — beige, off-white, muted greens — with accent touches of charcoal or black. Include houseplants like bonsai or bamboo. Emphasize harmony, simplicity, and nature in the design.',
    'American': 'Reflect American interior style blending traditional comfort and modern elements: open floor plan, cozy seating (sectional sofas, armchairs), warm hardwood floors, trim molding, large windows with curtains, recessed lighting, built-in cabinetry. Palette: neutrals (ivory, taupe, gray), accent colors like navy, maroon, forest green. Decor: throw pillows, area rugs, framed artwork, bookshelves, indoor plants. Blend functional with aesthetic touches.',
    'Chinese': 'Draw from Chinese interior aesthetics: balance, symmetry, rich wood tones (rosewood, walnut), carved wooden panels, lattice screens, ceramic vases, porcelain elements, silk cushions or wall hangings, bronze/gold accents. Palette: deep reds, auburn, jade green, black lacquer. Use patterns like repeating motifs, Chinese joinery details, subtle traditional art pieces. Lighting: warm ambient lantern-style fixtures.',
    'Traditional Indian': 'Infuse Indian heritage and decor: carved solid wood furniture (teak, rosewood), jali lattice work, traditional motifs (paisley, floral), block prints, brass or copper accents, handwoven textiles (silk, cotton), colorful rugs. Palette: deep saffron, earthy browns, rich maroon, peacock blue, ochre. Decorative elements: handicrafts, murals, lanterns, brass lamps, hanging jhulas (swings). Natural light, warm tones, textures everywhere.',
    'Coastal': 'Evoke breezy coastal interiors: bright, airy, and relaxed. Use white or off-white walls, pale blues, aquamarine, sand-beige accents, driftwood furniture, wicker or rattan chairs, nautical fabrics (stripes, linen), jute rugs, glass or sea-glass accessories. Decor: seashells, coral, ropes, light wood, potted palms. Maximize natural light, sheer curtains, glass doors to view outdoors. Materials: bleached wood, glass, linen, light metals.',
    'Arabic': 'Channel Middle Eastern & Arabian aesthetics: geometric patterns (mashrabiya lattice, arabesque), arch shapes, ornate tilework, mosaic, carved wood, brass lanterns, richly patterned rugs, low sofas, plush cushions, heavy drapery, opulent fabrics (silk, velvet). Palette: jewel tones (emerald, ruby, sapphire), gold, deep turquoise, sand-beige. Lighting: lanterns, warm glow, decorative metal screens casting shadows.',
    'Modern': 'Showcase contemporary modern interior: sleek lines, minimal ornamentation, open plan, neutral palette (white, gray, black), accent color pops (mustard, teal), mixture of materials (glass, steel, concrete, wood), integrated lighting (LED strips), large windows, floating furniture, minimal clutter. Decor: abstract art, sculptural elements, functional furniture minimalist in design. Focus on clean, streamlined aesthetics.',
    'Futuristic': 'Design with visionary, high-tech interiors: smooth curved surfaces, metallic or glossy surfaces (chromes, brushed aluminum), LED lighting accents (neon, color-changing), glass walls, reflective floors, smart-home displays, minimal structure, modular furniture, floating elements. Palette: cool neutrals (silver, white, charcoal), pops of neon or LED accent colors (electric blue, green). Atmosphere: sleek, sci-fi, ultra-clean, ambient lighting.',
    'African': 'Blend African interior motifs, earthy, textured, and vibrant. Use natural materials: woven baskets, rattan, carved wood, mud cloth, leather, natural stone. Palette: warm earth tones (terracotta, ochre, burnt sienna, deep browns), accent colors like deep red, turquoise, sunset orange. Motifs: tribal patterns, masks, woven textiles, batik prints. Decor: handcrafted pottery, woven rugs, wooden sculptures, indoor plants. Lighting: warm, natural, with visible textures and shadows.',
};


export async function createMagicInterior(input: MagicInteriorInput): Promise<z.infer<typeof MagicInteriorOutputSchema>> {
  return magicInteriorFlow(input);
}


const magicInteriorFlow = ai.defineFlow(
  {
    name: 'magicInteriorFlow',
    inputSchema: MagicInteriorInputSchema,
    outputSchema: MagicInteriorOutputSchema,
    retries: 2,
  },
  async (input) => {
    const stylePrompt = styleDescriptions[input.styleSelected] || styleDescriptions['Modern'];

    const prompt = `
      You are a hyper-realistic interior design image editor. Your ONLY task is to redesign the provided room photo.

      **CRITICAL RULES (NON-NEGOTIABLE):**
      1.  **PRESERVE STRUCTURE & PERSPECTIVE:** You MUST NOT change the room's geometry. Do not move, resize, add, or remove any walls, windows, doors, ceilings, or fixed architectural elements. The camera angle and perspective MUST remain identical.
      2.  **EDIT INTERIORS ONLY:** Only change movable items: furniture, decor, lighting, paint, and finishes.
      3.  **PRESERVE PEOPLE:** If people are in the photo, their identity, face, and body MUST NOT be changed.
      4.  **APPLY STYLE:** Redesign the interior in the **'${input.styleSelected}'** style using the **'${input.options.colorPalette}'** color palette and **'${input.options.lightingMood}'** lighting.
      5.  **STYLE DETAILS:** ${stylePrompt}
      6.  **WATERMARK:** Add a small, discreet watermark 'Magicpixa' in the bottom-right corner.

      Based on these strict rules, edit the provided photo of the '${input.roomType}'.
    `;

    const { media } = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
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

    return { redesignedPhotoDataUri: media.url };
  }
);

    