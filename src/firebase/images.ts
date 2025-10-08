
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
    uploadBytes,
    type FirebaseStorage,
} from 'firebase/storage';
import imageCompression from 'browser-image-compression';

async function dataUriToBlob(dataUri: string): Promise<Blob> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    return blob;
}

// This function is intended to be called from a client component.
export async function saveGeneratedImageClient(
  firestore: Firestore,
  storage: FirebaseStorage,
  userId: string,
  originalImageUri: string, // Keep this for reference if needed, though not saved currently
  processedImageDataUri: string, // This is expected to be a data URI from the AI
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

    // 1. Compress the image client-side
    const compressedFile = await imageCompression(generatedBlob as File, {
        maxWidthOrHeight: 1080,
        maxSizeMB: 0.5,
        useWebWorker: true,
        fileType: 'image/jpeg',
    });

    // 2. Upload the compressed image to Firebase Storage
    const timestamp = Date.now();
    const imageName = `${timestamp}_${processingType.replace(/\s+/g, '-')}_small.jpg`;
    const storagePath = `user_creations/${userId}/${processingType}/${imageName}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, compressedFile);
    
    // 3. Get the public download URL for the uploaded image
    const downloadURL = await getDownloadURL(storageRef);

    // 4. Save the public URL (and other metadata) to Firestore
    const imagesCollection = collection(firestore, `users/${userId}/generatedImages`);
    const newImageDocRef = doc(imagesCollection); // Create a new doc with a generated ID
    
    await setDoc(newImageDocRef, {
      id: newImageDocRef.id,
      userId,
      originalImageUrl: originalImageUri, // Save the original URI/URL for reference
      processedImageUrl: downloadURL, // Save the public Storage URL
      processingType,
      createdAt: serverTimestamp(),
      status: "success",
      creditsUsed: 1, // Assuming 1 credit, as per instructions
    });

  } catch (error) {
    console.error(`Failed to save image for user ${userId}:`, error);
    // Re-throw a more specific error for the UI to catch
    throw new Error('Could not save your creation automatically. Please try downloading it manually.');
  }
}
