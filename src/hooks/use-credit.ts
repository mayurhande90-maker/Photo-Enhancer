
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useAuth, updateDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const ANONYMOUS_QUOTA_KEY = 'anonymousUserQuota';
const ANONYMOUS_LIMIT = 1;

interface AnonymousQuota {
  credits: number;
}

export function useCredit() {
  const { user, loading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const [credits, setCredits] = useState(0);
  const [resetTime, setResetTime] = useState<Date | null>(null); // This is now only for display if needed
  const [isLoading, setIsLoading] = useState(true);

  const getAnonymousQuota = useCallback((): AnonymousQuota | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(ANONYMOUS_QUOTA_KEY);
    return stored ? JSON.parse(stored) : null;
  }, []);

  const setAnonymousQuota = useCallback((quota: AnonymousQuota) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ANONYMOUS_QUOTA_KEY, JSON.stringify(quota));
  }, []);

  useEffect(() => {
    const manageCredits = async () => {
      setIsLoading(true);

      if (isUserLoading) return; // Wait until we know if there is a user

      if (user && firestore) {
        // Logged-in user
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCredits(userData.credits ?? 0);
        } else {
          // This case should be handled at signup, but as a fallback:
          setCredits(0);
        }
      } else {
        // Anonymous user
        const storedQuota = getAnonymousQuota();
        if (storedQuota) {
          setCredits(storedQuota.credits);
        } else {
          // First time anonymous user
          setCredits(ANONYMOUS_LIMIT);
          setAnonymousQuota({ credits: ANONYMOUS_LIMIT });
        }
      }
      setIsLoading(false);
    };

    manageCredits();
  }, [user, isUserLoading, firestore, getAnonymousQuota, setAnonymousQuota]);
  
  const consumeCredits = useCallback(async (amount: number) => {
    const amountToDeduct = Math.max(0, amount);
    const newCreditValue = Math.max(0, credits - amountToDeduct);
    
    setCredits(newCreditValue); // Optimistic update

    if (user && firestore) {
        // Logged-in user: Update Firestore
        const userRef = doc(firestore, 'users', user.uid);
        // Use the non-blocking update function to get detailed errors
        updateDocumentNonBlocking(userRef, {
            credits: newCreditValue,
            lastCreditUpdate: serverTimestamp()
        });
    } else {
        // Anonymous user: Update localStorage
        setAnonymousQuota({ credits: newCreditValue });
    }
  }, [credits, user, firestore, setAnonymousQuota]);

  return { credits, resetTime, isLoading, consumeCredits };
}
