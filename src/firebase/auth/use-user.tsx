
'use client';

import { useUser as useFirebaseAuthUser } from '@/firebase/provider';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


export function useUser() {
  const { user, isUserLoading: isAuthLoading, userError } = useFirebaseAuthUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const userCreditsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/creditBalance/balance`);
  }, [user, firestore]);
  
  const { data: creditsDoc, isLoading: isCreditsLoading } = useDoc<{ credits: number }>(userCreditsRef);

  const isLoading = isAuthLoading || isProfileLoading || isCreditsLoading;
  
  if (isLoading || !user || !profile) {
    return { user: null, loading: isLoading, error: userError };
  }
  
  const userWithProfile: UserProfile = {
      ...user,
      ...profile,
      credits: creditsDoc?.credits ?? 0,
  };


  return { user: userWithProfile, loading: isLoading, error: userError };
}
