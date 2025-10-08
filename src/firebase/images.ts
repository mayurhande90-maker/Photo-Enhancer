
'use client';

import { 
    collection, 
    doc,
    setDoc, 
    serverTimestamp,
    type Firestore,
} from 'firebase/firestore';
import { 
    getDownloadURL, 
    ref, 
    uploadString,
    type FirebaseStorage,
} from 'firebase/storage';

// This function is intended to be called from a client component.
export async function saveGeneratedImageClient(
  firestore: Firestore,
  storage: FirebaseStorage,
  userId: string,
  originalImageUri: string, // Can be data URI or a URL
  processedImageDataUri: string, // This is expected to be a data URI from the AI
  processingType: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save an image.');
  }
  if (!processedImageDataUri.startsWith('data:')) {
    console.error('Processed image is not a data URI, cannot upload to Storage.');
    // Fallback or error handling
    throw new Error('Processed image is not a valid data URI.');
  }

  try {
    // 1. Upload the generated image data URI to Firebase Storage
    const imageName = `${Date.now()}.png`;
    const storageRef = ref(storage, `users/${userId}/generatedImages/${imageName}`);
    const uploadResult = await uploadString(storageRef, processedImageDataUri, 'data_url');
    
    // 2. Get the public download URL for the uploaded image
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // 3. Save the public URL (and other metadata) to Firestore
    const imagesCollection = collection(firestore, `users/${userId}/generatedImages`);
    const newImageDocRef = doc(imagesCollection); // Create a new doc with a generated ID
    
    await setDoc(newImageDocRef, {
      id: newImageDocRef.id,
      userId,
      originalImageUrl: originalImageUri, // Save the original URI/URL for reference
      processedImageUrl: downloadURL, // Save the public Storage URL
      processingType,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error(`Failed to save image for user ${userId}:`, error);
    // Optionally re-throw or handle the error in the UI
    throw new Error('Could not save image to your creations.');
  }
}
