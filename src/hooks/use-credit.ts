
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const ANONYMOUS_QUOTA_KEY = 'anonymousUserQuota';
const ANONYMOUS_LIMIT = 1;

interface AnonymousQuota {
  credits: number;
}

export function useCredit() {
  const { user, loading: isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [localCredits, setLocalCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine credits from the user object if available, otherwise from local state
  const credits = useMemo(() => {
      if (user && typeof user.credits === 'number') {
          return user.credits;
      }
      if (localCredits !== null) {
          return localCredits;
      }
      return 0;
  }, [user, localCredits]);

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
    const manageCredits = () => {
      if (isUserLoading) {
        setIsLoading(true);
        return;
      }

      if (user) {
        // For logged-in users, the `useUser` hook's profile data is the source of truth.
        // `user.credits` will be updated via the `useUser` hook's listener.
        // We don't need to set local credits here.
      } else {
        // Anonymous user
        const storedQuota = getAnonymousQuota();
        if (storedQuota) {
          setLocalCredits(storedQuota.credits);
        } else {
          // First time anonymous user
          setLocalCredits(ANONYMOUS_LIMIT);
          setAnonymousQuota({ credits: ANONYMOUS_LIMIT });
        }
      }
      setIsLoading(false);
    };

    manageCredits();
  }, [user, isUserLoading, getAnonymousQuota, setAnonymousQuota]);
  
  const consumeCredits = useCallback(async (amount: number) => {
    const amountToDeduct = Math.max(0, amount);
    
    if (user && firestore) {
        // Logged-in user: Update Firestore
        // The optimistic update is now handled by the `useUser` hook's real-time listener.
        const currentCredits = user.credits ?? 0;
        const newCreditValue = Math.max(0, currentCredits - amountToDeduct);
        const userRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userRef, { credits: newCreditValue });
    } else {
        // Anonymous user: Update localStorage
        const currentCredits = localCredits ?? 0;
        const newCreditValue = Math.max(0, currentCredits - amountToDeduct);
        setLocalCredits(newCreditValue);
        setAnonymousQuota({ credits: newCreditValue });
    }
  }, [user, firestore, localCredits, setAnonymousQuota]);

  return { 
      credits, 
      isLoading: isUserLoading || isLoading, 
      consumeCredits 
  };
}
