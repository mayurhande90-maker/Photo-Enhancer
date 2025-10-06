
'use client';

import { useState, useEffect, useCallback } from 'react';

const QUOTA_KEY = 'dailyQuota';
const DAILY_LIMIT = 10;
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

interface DailyQuota {
  credits: number;
  resetTimestamp: number;
}

export function useDailyQuota() {
  const [credits, setCredits] = useState(DAILY_LIMIT);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLocalStorageQuota = useCallback((): DailyQuota | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    const storedQuota = localStorage.getItem(QUOTA_KEY);
    return storedQuota ? (JSON.parse(storedQuota) as DailyQuota) : null;
  }, []);

  const setLocalStorageQuota = useCallback((quota: DailyQuota) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
  }, []);

  useEffect(() => {
    const quota = getLocalStorageQuota();
    const now = Date.now();

    if (quota && now < quota.resetTimestamp) {
      // User is within their 24-hour window
      setCredits(quota.credits);
      setResetTime(new Date(quota.resetTimestamp));
    } else {
      // Quota has expired or doesn't exist, so reset it
      const newResetTimestamp = now + TWENTY_FOUR_HOURS_IN_MS;
      const newQuota = { credits: DAILY_LIMIT, resetTimestamp: newResetTimestamp };
      setLocalStorageQuota(newQuota);
      setCredits(newQuota.credits);
      setResetTime(new Date(newQuota.resetTimestamp));
    }
    setIsLoading(false);
  }, [getLocalStorageQuota, setLocalStorageQuota]);

  const consumeCredits = useCallback((amount: number) => {
    const quota = getLocalStorageQuota();
    if (!quota) return; // Should not happen if useEffect ran

    // This ensures we only deduct credits, preventing the previous bug.
    const amountToDeduct = Math.abs(amount);
    const newCredits = Math.max(0, credits - amountToDeduct);
    
    setCredits(newCredits);
    setLocalStorageQuota({ ...quota, credits: newCredits });

  }, [credits, getLocalStorageQuota, setLocalStorageQuota]);

  return { credits, resetTime, isLoading, consumeCredits };
}
