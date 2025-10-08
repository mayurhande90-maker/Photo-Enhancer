
const CLOUDINARY_CONFIG = {
  cloudName: "magicpixa",
  uploadPreset: "magicpixa_unsigned",
};

function showToast(msg: string) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.position = "fixed";
    t.style.bottom = "24px";
    t.style.right = "24px";
    t.style.padding = "12px 20px";
    t.style.borderRadius = "12px";
    t.style.background = "linear-gradient(90deg,#6C63FF,#00D4FF)";
    t.style.color = "#fff";
    t.style.fontSize = "14px";
    t.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
    t.style.zIndex = "9999";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

export async function uploadToCloudinary(file: File, folder: string = "uploads"): Promise<string> {
  if (!file) {
    const message = "Please select a file before uploading.";
    console.error(message);
    showToast(`⚠️ ${message}`);
    throw new Error(message);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder", folder);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      // Don't try to parse JSON on a failed response. The body might be empty.
      // Throw an error with the status text, which is more reliable.
      const errorText = res.statusText || 'Upload failed due to a server error.';
      throw new Error(errorText);
    }
    
    const data = await res.json();
    
    if (!data.secure_url) {
        console.error("Cloudinary response missing secure_url. Full response:", data);
        throw new Error("Upload succeeded, but no URL was returned.");
    }

    showToast("✅ Image uploaded successfully!");
    return data.secure_url;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`Cloudinary upload process failed: ${message}`);
    showToast(`⚠️ Upload failed: ${message}`);
    throw new Error(message);
  }
}
