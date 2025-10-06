'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { UserProfile } from '@/lib/types';

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(
      (userAuth: User | null) => {
        if (userAuth) {
          if (!firestore) {
            const profile: UserProfile = {
              uid: userAuth.uid,
              email: userAuth.email,
              displayName: userAuth.displayName,
              photoURL: userAuth.photoURL,
              credits: 0,
            };
            setUser(profile);
            setLoading(false);
            return;
          }

          const userRef = doc(firestore, 'users', userAuth.uid);
          const unsubSnapshot = onSnapshot(
            userRef,
            (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                setUser({
                  uid: userAuth.uid,
                  email: userAuth.email,
                  displayName: userAuth.displayName,
                  photoURL: userAuth.photoURL,
                  credits: data.credits,
                });
              } else {
                 setUser({
                    uid: userAuth.uid,
                    email: userAuth.email,
                    displayName: userAuth.displayName,
                    photoURL: userAuth.photoURL,
                    credits: 0,
                 });
              }
              setLoading(false);
            },
            (err) => {
              console.error("Error fetching user data:", err);
              setError(err);
              setLoading(false);
            }
          );
          return () => unsubSnapshot();
        } else {
          setUser(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Auth state change error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading, error };
}
