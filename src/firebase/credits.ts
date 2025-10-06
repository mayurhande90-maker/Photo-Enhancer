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
    const userRef = db.collection('users').doc(userId);

    try {
        await userRef.set({
            uid: userId,
            email: profileData.email,
            displayName: profileData.displayName,
            credits: INITIAL_CREDITS,
            planName: 'Guest',
            creationTimestamp: FieldValue.serverTimestamp(),
        });
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
