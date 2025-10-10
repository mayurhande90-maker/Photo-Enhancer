'use client';

import type { User, Auth } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, type Firestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import type { FirebaseApp } from "firebase/app";

async function dataUriToBlob(dataUri: string): Promise<Blob> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    return blob;
}

function showToast(msg: string) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "linear-gradient(90deg,#6C63FF,#00D4FF)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    zIndex: "9999",
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

export async function saveAIOutput(
    app: FirebaseApp,
    firestore: Firestore,
    featureName: string, 
    fileBlobOrBase64: Blob | string, 
    fileType: string,
    userId: string
): Promise<string> {
    if (!firestore) {
        throw new Error("Firestore instance is not available.");
    }
    if (!app) {
        throw new Error("Firebase App instance is not available.");
    }
    if (!userId) {
        throw new Error("User is not authenticated. Please log in to save.");
    }
    
    let fileBlob: Blob;
    if (typeof fileBlobOrBase64 === 'string') {
        if (fileBlobOrBase64.startsWith('data:')) {
            fileBlob = await dataUriToBlob(fileBlobOrBase64);
        } else {
            // Assume it's a base64 string without the prefix
            const byteCharacters = atob(fileBlobOrBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            fileBlob = new Blob([byteArray], { type: fileType });
        }
    } else {
        fileBlob = fileBlobOrBase64;
    }

    try {
        // 1. Upload to Firebase Storage
        const storage = getStorage(app);
        const fileId = uuidv4();
        const extension = fileType.split('/')[1] || 'png';
        const storagePath = `user_creations/${userId}/${featureName}/${fileId}.${extension}`;
        const storageRef = ref(storage, storagePath);
        
        const uploadResult = await uploadBytes(storageRef, fileBlob, {
            contentType: fileType,
        });
        
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // 2. Save metadata to Firestore
        const creationsCollection = collection(firestore, `users/${userId}/generatedImages`);
        
        await addDoc(creationsCollection, {
            userId: userId,
            processingType: featureName,
            processedImageUrl: downloadURL,
            originalImageUrl: '', // This can be adapted if you pass the original URL
            createdAt: serverTimestamp(),
            status: "success",
            creditsUsed: 1, // Or the actual cost
        });
        
        showToast("✅ Saved to My Creations");
        return downloadURL;

    } catch (err) {
        console.error("Error saving AI output:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        showToast(`⚠️ Failed to save creation: ${errorMessage}`);
        throw err;
    }
}


export async function updateUserProfile(
  app: FirebaseApp,
  auth: Auth,
  firestore: Firestore,
  user: User,
  updates: any
): Promise<void> {
  if (!user || !auth.currentUser) {
    throw new Error("No user logged in to update profile.");
  }

  let newPhotoURL: string | undefined = user.photoURL || undefined;

  // Step 1: Handle photo upload if a new blob is provided
  if (updates.photoBlob) {
      newPhotoURL = await saveAIOutput(
        app,
        firestore,
        "profile-photo",
        updates.photoBlob,
        updates.photoBlob.type,
        user.uid
      );
  }

  // Step 2: Prepare updates for Auth and Firestore
  const authUpdates: { displayName?: string; photoURL?: string } = {};
  const firestoreUpdates: { [key: string]: any } = {};

  if (updates.displayName && updates.displayName !== user.displayName) {
    authUpdates.displayName = updates.displayName;
    firestoreUpdates.displayName = updates.displayName;
  }

  if (updates.bio !== undefined) {
    firestoreUpdates.bio = updates.bio;
  }

  // Only include photoURL if it has actually changed
  if (newPhotoURL && newPhotoURL !== user.photoURL) {
    authUpdates.photoURL = newPhotoURL;
    firestoreUpdates.photoURL = newPhotoURL;
  }
  
  // Step 3: Execute updates if there are any changes
  const promises = [];

  if (Object.keys(authUpdates).length > 0) {
    promises.push(updateProfile(auth.currentUser, authUpdates));
  }

  if (Object.keys(firestoreUpdates).length > 0) {
    const userDocRef = doc(firestore, "users", user.uid);
    promises.push(updateDoc(userDocRef, firestoreUpdates));
  }
    
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}
