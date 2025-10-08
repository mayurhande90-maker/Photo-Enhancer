
'use client';

import { 
    collection, 
    doc,
    addDoc, 
    serverTimestamp,
    type Firestore,
} from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

async function dataUriToBlob(dataUri: string): Promise<Blob> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    return blob;
}

// This function is intended to be called from a client component.
export async function saveGeneratedImageClient(
  firestore: Firestore,
  userId: string,
  originalImageUri: string, // Keep this for reference if needed
  processedImageDataUri: string,
  processingType: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save an image.');
  }
  if (!processedImageDataUri.startsWith('data:')) {
    throw new Error('Processed image is not a valid data URI.');
  }

  try {
    const generatedBlob = await dataUriToBlob(processedImageDataUri);
    const generatedFile = new File([generatedBlob], `${processingType}_${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    // Upload the generated image to Cloudinary
    const downloadURL = await uploadToCloudinary(generatedFile, `user_creations/${userId}/${processingType}`);

    const imagesCollection = collection(firestore, `users/${userId}/generatedImages`);
    
    await addDoc(imagesCollection, {
      userId,
      originalImageUrl: originalImageUri, 
      processedImageUrl: downloadURL, 
      processingType,
      createdAt: serverTimestamp(),
      status: "success",
      creditsUsed: 1, 
    });

  } catch (error) {
    console.error(`Failed to save image for user ${userId}:`, error);
    throw new Error('Could not save your creation automatically. Please try downloading it manually.');
  }
}
