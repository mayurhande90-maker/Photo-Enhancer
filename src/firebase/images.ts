
'use client';

import { 
    collection, 
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

  const generatedBlob = await dataUriToBlob(processedImageDataUri);
  
  // Upload the generated image to Cloudinary
  const downloadURL = await uploadToCloudinary(generatedBlob, `user_creations/${userId}/${processingType}`);

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
}
