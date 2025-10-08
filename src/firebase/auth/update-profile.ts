'use client';

import { updateProfile, type User, type Auth } from "firebase/auth";
import { doc, updateDoc, type Firestore } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage";
import imageCompression from "browser-image-compression";

interface ProfileUpdates {
  displayName?: string;
  bio?: string;
  photoBlob?: Blob;
}

export async function updateUserProfile(
    auth: Auth, // Explicitly require auth instance
    firestore: Firestore,
    storage: FirebaseStorage,
    user: User,
    updates: ProfileUpdates
): Promise<void> {
  if (!user || !auth.currentUser) throw new Error("No user logged in to update profile.");

  let newPhotoURL: string | undefined = undefined;

  // Step 1: Handle photo upload if a new blob is provided
  if (updates.photoBlob) {
    try {
      const compressedBlob = await imageCompression(updates.photoBlob as File, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 720,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      const fileName = `profile_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profile_images/${user.uid}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, compressedBlob);
      newPhotoURL = await getDownloadURL(snapshot.ref);

    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new Error("Failed to upload new profile picture. Please check storage rules and network.");
    }
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

  if (newPhotoURL) {
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
