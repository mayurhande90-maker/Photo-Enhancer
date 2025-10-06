'use client';

import { useUser as useFirebaseAuthUser } from '@/firebase/provider';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import type { User } from 'firebase/auth';


export function useUser() {
  const { user, isUserLoading: isAuthLoading, userError } = useFirebaseAuthUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = isAuthLoading || isProfileLoading;
  
  if (isLoading || !user) {
    return { user: null, loading: isLoading, error: userError };
  }
  
  // Combine the auth user with the firestore profile.
  // The User object from auth has priority for core fields like uid, email, etc.
  const userWithProfile: User & Partial<UserProfile> = {
      ...user,
      ...profile,
  };


  return { user: userWithProfile, loading: isLoading, error: userError };
}
