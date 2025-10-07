'use client';

import { 
    collection, 
    addDoc, 
    serverTimestamp,
    type Firestore,
} from 'firebase/firestore';

// This function is intended to be called from a client component.
export async function saveGeneratedImageClient(
  firestore: Firestore,
  userId: string,
  originalImageUrl: string,
  processedImageUrl: string,
  processingType: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save an image.');
  }

  try {
    const imagesCollection = collection(firestore, `users/${userId}/generatedImages`);
    
    await addDoc(imagesCollection, {
      userId,
      originalImageUrl,
      processedImageUrl,
      processingType,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error(`Failed to save image for user ${userId}:`, error);
    // We don't rethrow the error to avoid blocking the user flow
    // The image generation was successful, only saving failed.
    // This could be a Firestore size limit error, which needs a different architecture to solve (e.g., Cloud Storage).
  }
}
