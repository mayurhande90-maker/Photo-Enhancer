'use server';

import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from './server';

export async function deductCredits(userId: string, amount: number) {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      credits: increment(-amount),
    });
  } catch (error) {
     const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        await setDoc(userRef, { credits: 10 - amount });
    } else {
        console.error('Error deducting credits:', error);
        throw new Error('Failed to deduct credits.');
    }
  }
}

export async function initializeCredits(userId: string) {
    if (!userId) {
        throw new Error('User not authenticated');
    }
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, { credits: 10 });
    }
}
