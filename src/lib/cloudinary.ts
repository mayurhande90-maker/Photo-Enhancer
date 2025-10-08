
const CLOUDINARY_CONFIG = {
  cloudName: "magicpixa",
  uploadPreset: "magicpixa_unsigned",
};

function showToast(msg: string, isError: boolean = false) {
    if (typeof document === 'undefined') return;
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.position = "fixed";
    t.style.bottom = "24px";
    t.style.right = "24px";
    t.style.padding = "12px 20px";
    t.style.borderRadius = "12px";
    t.style.background = isError 
        ? "linear-gradient(90deg, #D32F2F, #FF5252)" 
        : "linear-gradient(90deg,#6C63FF,#00D4FF)";
    t.style.color = "#fff";
    t.style.fontSize = "14px";
    t.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
    t.style.zIndex = "9999";
    t.style.maxWidth = "300px";
    t.style.wordBreak = "break-word";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

export async function uploadToCloudinary(file: File | Blob, folder: string = "uploads"): Promise<string> {
    if (!file) {
      const errorMsg = "No file provided for upload.";
      console.error(errorMsg);
      showToast(`⚠️ ${errorMsg}`, true);
      throw new Error(errorMsg);
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
            // Don't assume the body is JSON. Use status text for a reliable error message.
            const errorText = res.statusText || `HTTP error ${res.status}`;
            console.error(`Cloudinary upload failed: ${errorText}`);
            throw new Error(`Upload failed: ${errorText}. Please check Cloudinary credentials.`);
        }

        const data = await res.json();

        if (data.error) {
            console.error("Cloudinary returned an error:", data.error);
            throw new Error(data.error.message || "An unknown Cloudinary error occurred.");
        }
        
        if (!data.secure_url) {
            console.error("Cloudinary response missing 'secure_url'. Full response:", data);
            throw new Error("Upload succeeded but no URL was returned.");
        }

        showToast("✅ Image uploaded successfully!");
        return data.secure_url;

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown network error occurred during upload.";
        console.error(`Cloudinary upload process failed: ${message}`);
        showToast(`⚠️ ${message}`, true);
        throw new Error(message);
    }
}
