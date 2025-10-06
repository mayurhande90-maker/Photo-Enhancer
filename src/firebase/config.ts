// This file is intentionally left blank. It will be populated
// with the Firebase configuration by the Firebase tooling.
// For now, we'll use a placeholder config.
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyC5k...Y",
  authDomain: "photocraft-ai-123.firebaseapp.com",
  projectId: "photocraft-ai-123",
  storageBucket: "photocraft-ai-123.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:a1b2c3d4e5f6a7b8c9d0e1",
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
