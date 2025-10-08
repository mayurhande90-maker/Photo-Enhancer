
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

  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  if (!currentUser) throw new Error("Current user not found in auth instance.");


  const firestoreUpdates: { [key: string]: any } = {};
  const authUpdates: { displayName?: string; photoURL?: string } = {};

  // 1. Handle text field updates
  if (updates.displayName && updates.displayName !== user.displayName) {
    firestoreUpdates.displayName = updates.displayName;
    authUpdates.displayName = updates.displayName;
  }
  if (updates.bio) firestoreUpdates.bio = updates.bio;
  if (updates.profession) firestoreUpdates.profession = updates.profession;


  // 2. Handle profile picture upload
  if (updates.photoFile) {
    try {
      const compressedFile = await imageCompression(updates.photoFile, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });

      const storageRef = ref(storage, `profile_images/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, compressedFile);
      const newPhotoURL = await getDownloadURL(storageRef);
      
      firestoreUpdates.photoURL = newPhotoURL;
      authUpdates.photoURL = newPhotoURL;

    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new Error("Failed to upload new profile picture.");
    }
  }

  // 3. Perform the updates if there are any changes
  try {
    const promises = [];

    // Update Firestore document if there are changes
    if (Object.keys(firestoreUpdates).length > 0) {
      const userDocRef = doc(firestore, "users", user.uid);
      promises.push(updateDoc(userDocRef, firestoreUpdates));
    }

    // Update Firebase Auth profile if there are changes
    if (Object.keys(authUpdates).length > 0) {
       promises.push(updateProfile(currentUser, authUpdates));
    }
    
    // Wait for all updates to complete
    if (promises.length > 0) {
        await Promise.all(promises);
    } else {
        // No changes were made
        return;
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Could not save profile changes.");
  }
}
