
'use server';

import { db } from './server';
import { FieldValue } from 'firebase-admin/firestore';

const INITIAL_CREDITS = 5;

export async function initializeCredits(userId: string) {
  const creditRef = db.collection('users').doc(userId).collection('creditBalance').doc('balance');
  try {
    await creditRef.set({ credits: INITIAL_CREDITS, lastUpdateTimestamp: FieldValue.serverTimestamp() });
    console.log(`Initialized credits for user ${userId} to ${INITIAL_CREDITS}`);
  } catch (error) {
    console.error(`Failed to initialize credits for user ${userId}:`, error);
    throw new Error('Could not initialize user credits.');
  }
}

export async function deductCredits(userId: string, amount: number) {
    if (!userId) {
        throw new Error('User ID is required to deduct credits.');
    }

    const creditRef = db.collection('users').doc(userId).collection('creditBalance').doc('balance');

    try {
        await db.runTransaction(async (transaction) => {
            const creditDoc = await transaction.get(creditRef);
            if (!creditDoc.exists) {
                throw new Error('Credit balance document does not exist.');
            }

            const currentCredits = creditDoc.data()?.credits ?? 0;
            if (currentCredits < amount) {
                throw new Error('Insufficient credits.');
            }

            const newBalance = currentCredits - amount;
            transaction.update(creditRef, { 
                credits: newBalance,
                lastUpdateTimestamp: FieldValue.serverTimestamp()
            });
        });
        console.log(`Successfully deducted ${amount} credits for user ${userId}.`);
    } catch (error) {
        console.error(`Failed to deduct credits for user ${userId}:`, error);
        // Re-throw the original error to be caught by the caller
        throw error;
    }
}
