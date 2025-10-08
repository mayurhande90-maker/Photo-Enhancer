
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
    t.style.background = msg.startsWith('✅') ? "linear-gradient(90deg,#6C63FF,#00D4FF)" : "linear-gradient(90deg, #FF6B6B, #FFB8B8)";
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", folder);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        
        if (!res.ok || data.error) {
            const errorMessage = data.error?.message || "Upload failed due to an unknown error.";
            console.error("Cloudinary upload failed:", data.error);
            throw new Error(errorMessage);
        }

        showToast("✅ Image uploaded successfully!");
        return data.secure_url;

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error(`Cloudinary upload process failed: ${message}`);
        showToast(`⚠️ Upload failed: ${message}. Please check your Cloudinary cloud name and unsigned upload preset.`);
        throw error;
    }
}
