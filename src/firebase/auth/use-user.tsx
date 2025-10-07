
'use client';

import { useMemo } from 'react';
import { useUser as useFirebaseAuthUser } from '@/firebase/provider';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import type { User as AuthUser } from 'firebase/auth';

// Combine Auth user with Firestore profile
export type AppUser = AuthUser & Partial<UserProfile>;

export function useUser() {
  const { user: authUser, isUserLoading: isAuthLoading, userError } = useFirebaseAuthUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!authUser || !firestore) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [authUser, firestore]);

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userProfileRef);

  const isLoading = isAuthLoading || isProfileLoading;
  
  const user = useMemo(() => {
    if (!authUser) return null;
    // Combine the auth user with the firestore profile.
    // The User object from auth has priority for core fields like uid, email, etc.
    const userWithProfile: AppUser = {
        ...authUser,
        ...(profile || {}), // Start with an empty object if profile is loading or null
    };

    // If profile has loaded, ensure its fields overwrite the authUser placeholders
    if (profile) {
        userWithProfile.displayName = profile.displayName ?? authUser.displayName;
        userWithProfile.credits = profile.credits;
        userWithProfile.planName = profile.planName;
    }
    
    return userWithProfile;

  }, [authUser, profile]);


  return { user, loading: isLoading, error: userError || profileError };
}
