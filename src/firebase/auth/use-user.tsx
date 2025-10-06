
'use client';

import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';

const mockUser: UserProfile = {
    uid: 'guest-user',
    email: 'guest@example.com',
    displayName: 'Guest User',
    photoURL: null,
    credits: 100,
};


export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate fetching a user
    setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
    }, 500)
  }, []);

  return { user, loading, error };
}
