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

  if (updates.displayName && updates.displayName !== user.displayName) {
    firestoreUpdates.displayName = updates.displayName;
    authUpdates.displayName = updates.displayName;
  }
  if (updates.bio !== undefined) firestoreUpdates.bio = updates.bio;
  if (updates.profession !== undefined) firestoreUpdates.profession = updates.profession;

  if (updates.photoBlob) {
    try {
      const imageFile = new File([updates.photoBlob], "profile.jpg", { type: 'image/jpeg' });
      const compressedFile = await imageCompression(imageFile, {
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

  const promises = [];

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
