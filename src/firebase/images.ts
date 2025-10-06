
'use server';

import { db } from './server';
import { FieldValue } from 'firebase-admin/firestore';

export async function saveGeneratedImage(
  userId: string,
  originalImageUrl: string,
  processedImageUrl: string,
  processingType: string
) {
  if (!userId) {
    throw new Error('User ID is required to save an image.');
  }

  const imageRef = db.collection('users').doc(userId).collection('generatedImages').doc();

  try {
    await imageRef.set({
      id: imageRef.id,
      userId: userId,
      originalImageUrl,
      processedImageUrl,
      processingType,
      generationTimestamp: FieldValue.serverTimestamp(),
    });
    console.log(`Image ${imageRef.id} saved for user ${userId}`);
  } catch (error) {
    console.error(`Failed to save image for user ${userId}:`, error);
    throw new Error('Could not save generated image.');
  }
}
