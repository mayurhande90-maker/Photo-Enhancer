'use server';
/**
 * @fileOverview A server-side flow to handle uploading any AI-generated file to Firebase Storage.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const db = getFirestore();
const bucket = getStorage().bucket();

const UploadAIOutputInputSchema = z.object({
  featureName: z.string(),
  base64File: z.string(),
  fileType: z.string(),
  userId: z.string(),
});

const UploadAIOutputOutputSchema = z.object({
  success: z.boolean(),
  downloadURL: z.string().optional(),
});

export const uploadAIOutput = ai.defineFlow(
  {
    name: 'uploadAIOutput',
    inputSchema: UploadAIOutputInputSchema,
    outputSchema: UploadAIOutputOutputSchema,
    auth: (auth, input) => {
        if (!auth) {
            throw new Error("Not authenticated.");
        }
        if(auth.uid !== input.userId) {
            throw new Error("User ID does not match authenticated user.");
        }
    }
  },
  async ({ featureName, base64File, fileType, userId }) => {
    try {
      const timestamp = Date.now();
      const extensionMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'application/pdf': 'pdf',
        'text/plain': 'txt',
        'application/json': 'json',
      };

      const ext = extensionMap[fileType] || 'dat';
      const fileName = `${featureName.replace(/\s+/g, '_')}_${timestamp}.${ext}`;
      const filePath = `user_creations/${userId}/${featureName.replace(/\s+/g, '_')}/${fileName}`;
      const buffer = Buffer.from(base64File, 'base64');

      // Compress if image
      let finalBuffer = buffer;
      if (fileType.startsWith('image/')) {
        finalBuffer = await sharp(buffer)
          .resize({ width: 1080, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      // Upload to Firebase Storage
      const file = bucket.file(filePath);
      await file.save(finalBuffer, {
        metadata: {
          contentType: fileType,
          metadata: { firebaseStorageDownloadTokens: uuidv4() },
        },
      });

      // Generate download URL
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

      // Save metadata in Firestore
      await db.collection('users')
        .doc(userId)
        .collection('generatedImages') // Changed from myCreations to match existing structure
        .add({
          userId,
          processingType: featureName,
          fileType,
          processedImageUrl: publicUrl,
          createdAt: new Date(),
          creditsUsed: 1, // You might want to adjust this based on the feature
        });
      
      return { success: true, downloadURL: publicUrl };

    } catch (error: any) {
      console.error('Error uploading AI output:', error);
      throw new Error(error.message || "An internal error occurred during file upload.");
    }
  }
);
