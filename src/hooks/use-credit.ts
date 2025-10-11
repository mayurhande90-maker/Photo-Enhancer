
'use client';

import { useState, useCallback, useMemo } from 'react';

// This hook is now a placeholder as all credit and user functionality is disabled.
export function useCredit() {
  const consumeCredits = useCallback(async (amount: number) => {
    // Do nothing, as functionality is disabled.
    console.log(`Attempted to consume ${amount} credits. Feature is disabled.`);
  }, []);

  return { 
      credits: 0, 
      isLoading: false, 
      consumeCredits 
  };
}
