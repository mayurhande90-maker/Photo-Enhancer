import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

try {
    if (getApps().length === 0) {
        app = initializeApp();
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
