'use server';

import { getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {credential} from 'firebase-admin';
import Razorpay from 'razorpay';

const INITIAL_CREDITS = 10;

// Initialize Firebase Admin SDK if not already initialized
function initializeAdminApp(): App {
    if (getApps().length === 0) {
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        return initializeApp({
            credential: credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
      } else {
        // For local development without service account, or in environments where it's auto-discovered
        return initializeApp();
      }
    }
    return getApp();
}


export async function signupAction(credentials: {email: string, password: string, displayName: string}) {
  const { email, password, displayName } = credentials;
  
  try {
    const adminApp = initializeAdminApp();
    const adminAuth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    // 1. Create the user with email and password
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });
    
    // 2. Create the user profile document in Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      credits: INITIAL_CREDITS,
      planName: 'Guest',
      creationTimestamp: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Signup Action Error:', error);
    // Return a serializable error object
    return { error: error.message || 'An unknown error occurred during signup.' };
  }
}


export async function deductCredits(userId: string, amount: number) {
    if (!userId) {
        throw new Error('User ID is required to deduct credits.');
    }
    
    const adminApp = initializeAdminApp();
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(userId);

    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User profile does not exist.');
            }

            const currentCredits = userDoc.data()?.credits ?? 0;
            if (currentCredits < amount) {
                throw new Error('Insufficient credits.');
            }

            const newBalance = currentCredits - amount;
            transaction.update(userRef, { 
                credits: newBalance,
                lastCreditUpdate: FieldValue.serverTimestamp()
            });
        });
        console.log(`Successfully deducted ${amount} credits for user ${userId}.`);
    } catch (error) {
        console.error(`Failed to deduct credits for user ${userId}:`, error);
        // Re-throw the original error to be caught by the caller
        throw error;
    }
}


export async function createRazorpayOrder(amount: number, currency: string) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay API keys are not configured.');
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount * 100, // Amount in the smallest currency unit (e.g., paisa for INR)
    currency,
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return { error: error.message || 'An unknown error occurred while creating the Razorpay order.' };
  }
}
