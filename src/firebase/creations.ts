
'use client';

import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

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
    featureName: string, 
    fileBlobOrBase64: Blob | string, 
    fileType: string,
    userId?: string
): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    const currentUserId = userId || user?.uid;

    if (!currentUserId) {
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
        const storage = getStorage();
        const fileId = uuidv4();
        const extension = fileType.split('/')[1] || 'png';
        const storagePath = `user_creations/${currentUserId}/${featureName}/${fileId}.${extension}`;
        const storageRef = ref(storage, storagePath);
        
        const uploadResult = await uploadBytes(storageRef, fileBlob, {
            contentType: fileType,
        });
        
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // 2. Save metadata to Firestore
        const firestore = getFirestore();
        const creationsCollection = collection(firestore, `users/${currentUserId}/generatedImages`);
        
        await addDoc(creationsCollection, {
            userId: currentUserId,
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
