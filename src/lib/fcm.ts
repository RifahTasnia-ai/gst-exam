import { getMessaging, getToken } from "firebase/messaging";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { app, db } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

/**
 * Request notification permission and save FCM token.
 */
export async function requestNotificationPermission(studentId: string): Promise<boolean> {
    try {
        if (typeof window === "undefined" || !("Notification" in window)) {
            console.log("Notifications not supported");
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Notification permission denied");
            return false;
        }

        const messaging = getMessaging(app);
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (!token) {
            console.log("Failed to get FCM token");
            return false;
        }

        // Check if this token is already saved
        const savedToken = localStorage.getItem("fcm_token");
        if (savedToken === token) return true;

        // Check if token already exists in Firestore
        const tokensRef = collection(db, "fcmTokens");
        const q = query(tokensRef, where("token", "==", token));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            await addDoc(tokensRef, {
                token,
                studentId,
                createdAt: serverTimestamp(),
            });
        }

        localStorage.setItem("fcm_token", token);
        return true;
    } catch (error) {
        console.error("Error setting up notifications:", error);
        return false;
    }
}

/**
 * Check if notification permission was recently dismissed.
 */
export function wasNotifDismissed(): boolean {
    const dismissed = localStorage.getItem("notif_dismissed");
    if (!dismissed) return false;

    const dismissedAt = parseInt(dismissed, 10);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt < sevenDays;
}

/**
 * Save dismissal timestamp.
 */
export function dismissNotifPrompt(): void {
    localStorage.setItem("notif_dismissed", Date.now().toString());
}
