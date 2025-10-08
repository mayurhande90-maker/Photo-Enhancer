
'use client';

import { getAuth, updateProfile, type User } from "firebase/auth";
import { getFirestore, doc, updateDoc, type Firestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage";
import imageCompression from "browser-image-compression";

interface ProfileUpdates {
  displayName?: string;
  bio?: string;
  profession?: string;
  photoFile?: File;
}

export async function updateUserProfile(
    firestore: Firestore,
    storage: FirebaseStorage,
    user: User,
    updates: ProfileUpdates
): Promise<void> {

  if (!user) throw new Error("No user logged in to update profile.");

  let newPhotoURL: string | undefined = undefined;

  // 1. If a new photo file is provided, compress and upload it.
  if (updates.photoFile) {
    try {
      const compressedFile = await imageCompression(updates.photoFile, {
        maxSizeMB: 0.2, // Compress to a smaller size for profile pictures
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });

      const storageRef = ref(storage, `profile_images/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, compressedFile);
      newPhotoURL = await getDownloadURL(storageRef);

    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new Error("Failed to upload new profile picture.");
    }
  }

  // 2. Prepare data for Firestore and Auth updates.
  const firestoreUpdates: { [key: string]: any } = {};
  if (updates.displayName) firestoreUpdates.displayName = updates.displayName;
  if (updates.bio) firestoreUpdates.bio = updates.bio;
  if (updates.profession) firestoreUpdates.profession = updates.profession;
  if (newPhotoURL) firestoreUpdates.photoURL = newPhotoURL;

  const authUpdates: { displayName?: string; photoURL?: string } = {};
  if (updates.displayName) authUpdates.displayName = updates.displayName;
  if (newPhotoURL) authUpdates.photoURL = newPhotoURL;

  // 3. Perform the updates.
  try {
    // Update Firestore document
    if (Object.keys(firestoreUpdates).length > 0) {
      const userDocRef = doc(firestore, "users", user.uid);
      await updateDoc(userDocRef, firestoreUpdates);
    }

    // Update Firebase Auth profile
    if (Object.keys(authUpdates).length > 0) {
      const authInstance = getAuth();
      if (authInstance.currentUser) {
         await updateProfile(authInstance.currentUser, authUpdates);
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Could not save profile changes.");
  }
}
