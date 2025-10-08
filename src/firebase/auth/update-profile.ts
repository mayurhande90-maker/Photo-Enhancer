'use client';

import { getAuth, updateProfile, type User } from "firebase/auth";
import { getFirestore, doc, updateDoc, type Firestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage";
import imageCompression from "browser-image-compression";

interface ProfileUpdates {
  displayName?: string;
  bio?: string;
  photoBlob?: Blob;
}

export async function updateUserProfile(
    firestore: Firestore,
    storage: FirebaseStorage,
    user: User,
    updates: ProfileUpdates
): Promise<void> {
  if (!user) throw new Error("No user logged in to update profile.");

  let newPhotoURL: string | undefined = undefined;

  // Step 1: Handle photo upload if a new blob is provided
  if (updates.photoBlob) {
    try {
      const compressedFile = await imageCompression(updates.photoBlob as File, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 720,
        useWebWorker: true,
      });

      const fileName = `profile_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profile_images/${user.uid}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, compressedFile);
      newPhotoURL = await getDownloadURL(snapshot.ref);

    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new Error("Failed to upload new profile picture. Check storage rules.");
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

  const promises = [];

  // Step 3: Execute updates if there are any changes
  if (Object.keys(authUpdates).length > 0) {
    const authInstance = getAuth();
    if (authInstance.currentUser) {
       promises.push(updateProfile(authInstance.currentUser, authUpdates));
    }
  }

  if (Object.keys(firestoreUpdates).length > 0) {
    const userDocRef = doc(firestore, "users", user.uid);
    promises.push(updateDoc(userDocRef, firestoreUpdates));
  }
    
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}
