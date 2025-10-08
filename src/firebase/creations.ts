'use client';

import { useAuth } from '@/firebase/provider';
import { uploadAIOutput } from '@/ai/flows/upload-ai-output';
import { useToast } from '@/hooks/use-toast';

function showToast(msg: string, variant: 'default' | 'destructive' = 'default') {
    const { toast } = useToast();
    toast({
        description: msg,
        variant: variant,
    });
}

export async function saveAIOutput(featureName: string, fileBlobOrBase64: Blob | string, fileType: string, userId: string) {
  try {
    if (!userId) {
      alert("Please log in to save your creation.");
      return;
    }

    // Convert to base64 if Blob or File
    let base64File = "";
    if (fileBlobOrBase64 instanceof Blob) {
      const reader = new FileReader();
      base64File = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(fileBlobOrBase64);
      });
    } else if (typeof fileBlobOrBase64 === "string" && fileBlobOrBase64.startsWith("data:")) {
      base64File = fileBlobOrBase64.split(",")[1];
    } else if (typeof fileBlobOrBase64 === "string") {
      base64File = fileBlobOrBase64; // Assume it's already a base64 string
    }
     else {
      throw new Error("Unsupported file format");
    }

    const result = await uploadAIOutput({ featureName, base64File, fileType, userId });

    if (result.success) {
        showToast("✅ Saved to My Creations");
        console.log("File URL:", result.downloadURL);
        return result.downloadURL;
    } else {
        throw new Error("Cloud function returned failure status.");
    }
  } catch (err: any) {
    console.error("Error saving AI output:", err);
    showToast(`⚠️ Failed to save creation: ${err.message}`, 'destructive');
    throw err;
  }
}
