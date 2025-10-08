
'use client';

import type { User, Auth } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, type Firestore } from "firebase/firestore";
import { saveAIOutput } from "@/firebase/creations";

interface ProfileUpdates {
  displayName?: string;
  bio?: string;
  photoBlob?: Blob;
}

export async function updateUserProfile(
  auth: Auth,
  firestore: Firestore,
  user: User,
  updates: ProfileUpdates
): Promise<void> {
  if (!user || !auth.currentUser) {
    throw new Error("No user logged in to update profile.");
  }

  let newPhotoURL: string | undefined = user.photoURL || undefined;

  // Step 1: Handle photo upload if a new blob is provided
  if (updates.photoBlob) {
      newPhotoURL = await saveAIOutput(
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
