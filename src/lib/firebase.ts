import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getFirestore,
    Firestore,
    enableIndexedDbPersistence,
} from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Lazily initialize Firebase to avoid SSR prerender failures
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _persistenceEnabled = false;

function getFirebaseApp(): FirebaseApp {
    if (!_app) {
        _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    }
    return _app;
}

function getDb(): Firestore {
    if (!_db) {
        _db = getFirestore(getFirebaseApp());

        // Enable offline persistence (client only, once)
        if (typeof window !== "undefined" && !_persistenceEnabled) {
            _persistenceEnabled = true;
            enableIndexedDbPersistence(_db).catch((err) => {
                if (err.code === "failed-precondition") {
                    console.warn("Firestore persistence failed: multiple tabs open");
                } else if (err.code === "unimplemented") {
                    console.warn("Firestore persistence not available in this browser");
                }
            });
        }
    }
    return _db;
}

function getAuthInstance(): Auth {
    if (!_auth) {
        _auth = getAuth(getFirebaseApp());
    }
    return _auth;
}

// Export getters so Firebase only initializes when accessed at runtime (client side)
export const app = typeof window !== "undefined" ? getFirebaseApp() : ({} as FirebaseApp);
export const db = typeof window !== "undefined" ? getDb() : ({} as Firestore);
export const auth = typeof window !== "undefined" ? getAuthInstance() : ({} as Auth);
