import { initializeApp, getApps, getApp, App, credential } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

try {
    if (getApps().length === 0) {
        if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
            app = initializeApp({
                credential: credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            app = initializeApp();
        }
    } else {
        app = getApp();
    }

    db = getFirestore(app);
} catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    // Mock Firestore in case of failure
    db = {} as Firestore;
}

export { db };
