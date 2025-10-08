
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
  try {
    if (!file) throw new Error("No file selected.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Cloudinary upload failed with response:", errorData);
        throw new Error(`Upload failed: ${errorData.error.message}`);
    }
    
    const data = await res.json();
    showToast("✅ Image uploaded successfully!");
    return data.secure_url;

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    showToast("⚠️ Failed to upload image");
    throw error;
  }
}
