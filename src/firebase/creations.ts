
'use client';

import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

export async function saveAIOutput(featureName: string, fileBlobOrBase64: Blob | string, fileType: string) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save your creation.");
      return;
    }

    // Convert to base64 if Blob or File
    let base64File = "";
    if (fileBlobOrBase64 instanceof Blob) {
      const reader = new FileReader();
      base64File = await new Promise((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        }
        reader.readAsDataURL(fileBlobOrBase64);
      });
    } else if (typeof fileBlobOrBase64 === "string" && fileBlobOrBase64.startsWith("data:")) {
      base64File = fileBlobOrBase64.split(",")[1];
    } else {
      throw new Error("Unsupported file format provided to saveAIOutput.");
    }

    const functions = getFunctions();
    const uploadFn = httpsCallable(functions, "uploadAIOutput");
    const result: any = await uploadFn({ featureName, base64File, fileType });

    if (result.data.success) {
      showToast("✅ Saved to My Creations");
      console.log("File URL:", result.data.downloadURL);
      return result.data.downloadURL;
    } else {
      showToast("⚠️ Upload failed. Please try again.");
    }
  } catch (err) {
    console.error("Error saving AI output:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    showToast(`⚠️ Failed to save creation: ${errorMessage}`);
  }
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
