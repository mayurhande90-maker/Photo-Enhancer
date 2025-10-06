'use server';

import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const INITIAL_CREDITS = 10;

// Initialize Firebase Admin SDK if not already initialized
function initializeAdminApp() {
    if (getApps().length === 0) {
        return initializeApp();
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
