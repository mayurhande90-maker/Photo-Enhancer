
'use server';

import { db } from './server';
import { FieldValue } from 'firebase-admin/firestore';

const INITIAL_CREDITS = 10;

type UserProfileData = {
    email: string;
    displayName: string;
}

export async function createUserProfileAndCredits(userId: string, profileData: UserProfileData) {
    if (!userId) {
        throw new Error('User ID is required.');
    }
    const batch = db.batch();

    // 1. Create user profile document
    const userRef = db.collection('users').doc(userId);
    batch.set(userRef, {
        uid: userId,
        ...profileData
    });

    // 2. Create credit balance document
    const creditRef = userRef.collection('creditBalance').doc('balance');
    batch.set(creditRef, { 
        credits: INITIAL_CREDITS, 
        lastUpdateTimestamp: FieldValue.serverTimestamp() 
    });

    try {
        await batch.commit();
        console.log(`Successfully created profile and initialized credits for user ${userId}`);
    } catch (error) {
        console.error(`Failed to create profile and initialize credits for user ${userId}:`, error);
        throw new Error('Could not create user profile and initialize credits.');
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
