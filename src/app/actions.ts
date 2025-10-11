
'use server';

// All actions are disabled to remove backend functionality.

export async function analyzeImageAction(photoDataUri: string) {
    return { analysis: "Feature is disabled." };
}

export async function colorCorrectAction(photoUrl: string) {
  return { enhancedPhotoDataUri: '' };
}

export async function restorePhotoAction(photoUrl: string) {
  return { enhancedPhotoDataUri: '' };
}

export async function removeBackgroundAction(photoUrl: string) {
  return { enhancedPhotoDataUri: '' };
}

export async function studioEnhanceAction(photoUrl: string) {
  return { enhancedPhotoDataUri: '' };
}

export async function colorizePhotoAction(photoUrl: string) {
  return { enhancedPhotoDataUri: '' };
}

export async function pictureWithCelebrityAction(userPhotoDataUri: string, celebrity: string, location: string) {
  return { enhancedPhotoDataUri: '' };
}

export async function createYoutubeThumbnailAction(
    photoDataUri: string, 
    videoType: string, 
    categorySelected: string,
    moodSelected: string,
    alignmentSelected: string
) {
    return { enhancedPhotoDataUri: '' };
}

export async function aiFutureSelfAction(
    photoDataUri: string, 
    ageGap: number
) {
    return { agedPhotoDataUri: '' };
}

export async function magicInteriorAction(
    photoDataUri: string,
    roomType: string,
    styleSelected: string,
    options: {
        colorPalette: string;
    }
) {
    return { redesignedPhotoDataUri: '' };
}
