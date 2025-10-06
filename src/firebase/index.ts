'use client';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5k...Y",
  authDomain: "photocraft-ai-123.firebaseapp.com",
  projectId: "photocraft-ai-123",
  storageBucket: "photocraft-ai-123.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:a1b2c3d4e5f6a7b8c9d0e1",
};

function initializeFirebase() {
  const isInitialized = getApps().length > 0;
  const firebaseApp = isInitialized ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

export { initializeFirebase };

export * from './provider';
export * from './auth/use-user';
