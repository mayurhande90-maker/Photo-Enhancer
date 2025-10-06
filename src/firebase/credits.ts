
'use server';

// This is a mock implementation since auth is disabled.
// In a real scenario, this would interact with a database.

let credits = 100;

export async function deductCredits(userId: string, amount: number) {
  if (userId !== 'guest-user') {
    // In a real app, you might throw an error or handle other users
    return; 
  }
  
  if (credits >= amount) {
    credits -= amount;
    console.log(`Deducted ${amount} credits. Remaining: ${credits}`);
  } else {
    console.log('Not enough credits to deduct.');
    throw new Error('Insufficient credits.');
  }
}

export async function initializeCredits(userId: string) {
    if (userId === 'guest-user') {
        credits = 100;
        console.log('Initialized guest credits to 100.');
    }
}
