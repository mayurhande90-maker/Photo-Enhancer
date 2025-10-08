'use client';

import { getAuth, updateProfile, type User } from "firebase/auth";
import { getFirestore, doc, updateDoc, type Firestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage";
import imageCompression from "browser-image-compression";

interface ProfileUpdates {
  displayName?: string;
  bio?: string;
  profession?: string;
  photoBlob?: Blob;
}

export async function updateUserProfile(
    firestore: Firestore,
    storage: FirebaseStorage,
    user: User,
    updates: ProfileUpdates
): Promise<void> {

  if (!user) throw new Error("No user logged in to update profile.");

  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  if (!currentUser) throw new Error("Current user not found in auth instance.");

  const firestoreUpdates: { [key: string]: any } = {};
  const authUpdates: { displayName?: string; photoURL?: string } = {};

  let newPhotoURL = currentUser.photoURL;

  // Step 1: Handle photo upload if a new blob is provided
  if (updates.photoBlob) {
    try {
      const compressedFile = await imageCompression(updates.photoBlob, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 720,
        useWebWorker: true,
      });

      const fileName = `profile_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profile_images/${user.uid}/${fileName}`);
      
      // Await the upload and get the snapshot
      const snapshot = await uploadBytes(storageRef, compressedFile);
      
      // Await getting the download URL
      newPhotoURL = await getDownloadURL(snapshot.ref);

    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new Error("Failed to upload new profile picture. Check storage rules.");
    }
  }

  // Step 2: Prepare updates for Firestore and Auth
  if (updates.displayName && updates.displayName !== currentUser.displayName) {
    firestoreUpdates.displayName = updates.displayName;
    authUpdates.displayName = updates.displayName;
  }
  
  if (updates.bio !== undefined) firestoreUpdates.bio = updates.bio;
  if (updates.profession !== undefined) firestoreUpdates.profession = updates.profession;

  if (newPhotoURL !== currentUser.photoURL) {
      firestoreUpdates.photoURL = newPhotoURL;
      authUpdates.photoURL = newPhotoURL;
  }

  const promises = [];

  // Step 3: Execute updates
  if (Object.keys(firestoreUpdates).length > 0) {
    const userDocRef = doc(firestore, "users", user.uid);
    promises.push(updateDoc(userDocRef, firestoreUpdates));
  }

  if (Object.keys(authUpdates).length > 0) {
     promises.push(updateProfile(currentUser, authUpdates));
  }
    
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}
