
'use client';

import { useState, useEffect, useCallback } from 'react';

const QUOTA_KEY = 'monthlyQuota';
const MONTHLY_LIMIT = 10;
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

interface MonthlyQuota {
  credits: number;
  resetTimestamp: number;
}

export function useMonthlyQuota() {
  const [credits, setCredits] = useState(MONTHLY_LIMIT);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLocalStorageQuota = useCallback((): MonthlyQuota | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    const storedQuota = localStorage.getItem(QUOTA_KEY);
    return storedQuota ? (JSON.parse(storedQuota) as MonthlyQuota) : null;
  }, []);

  const setLocalStorageQuota = useCallback((quota: MonthlyQuota) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
  }, []);

  useEffect(() => {
    const quota = getLocalStorageQuota();
    const now = Date.now();

    if (quota && now < quota.resetTimestamp) {
      // User is within their 30-day window
      setCredits(quota.credits);
      setResetTime(new Date(quota.resetTimestamp));
    } else {
      // Quota has expired or doesn't exist, so reset it
      const newResetTimestamp = now + THIRTY_DAYS_IN_MS;
      const newQuota = { credits: MONTHLY_LIMIT, resetTimestamp: newResetTimestamp };
      setLocalStorageQuota(newQuota);
      setCredits(newQuota.credits);
      setResetTime(new Date(newQuota.resetTimestamp));
    }
    setIsLoading(false);
  }, [getLocalStorageQuota, setLocalStorageQuota]);

  const consumeCredits = useCallback((amount: number) => {
    const quota = getLocalStorageQuota();
    if (!quota) return; // Should not happen if useEffect ran

    const amountToDeduct = Math.abs(amount);
    const newCredits = Math.max(0, credits - amountToDeduct);
    
    setCredits(newCredits);
    setLocalStorageQuota({ ...quota, credits: newCredits });

  }, [credits, getLocalStorageQuota, setLocalStorageQuota]);

  return { credits, resetTime, isLoading, consumeCredits };
}
