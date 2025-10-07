'use client';

import { 
    collection, 
    addDoc, 
    serverTimestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '.';

// This function is intended to be called from a client component.
export async function saveGeneratedImageClient(
  userId: string,
  originalImageUrl: string,
  processedImageUrl: string, // This will be an empty string for now
  processingType: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save an image.');
  }

  // We need to initialize firebase here because this is called from the client
  const { firestore } = initializeFirebase();

  try {
    const imagesCollection = collection(firestore, `users/${userId}/generatedImages`);
    
    await addDoc(imagesCollection, {
      userId,
      originalImageUrl,
      processedImageUrl: '', // Saving empty string to avoid firestore size limit error
      processingType,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error(`Failed to save image for user ${userId}:`, error);
    // We don't rethrow the error to avoid blocking the user flow
    // The image generation was successful, only saving failed.
  }
}
