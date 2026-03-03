import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Send notification to all registered devices when a new lecture is published.
 */
export const onNewLecturePublished = functions.firestore
    .document("lectures/{lectureId}")
    .onCreate(async (snapshot) => {
        const lecture = snapshot.data();

        if (!lecture.published) {
            console.log("Lecture not published, skipping notification");
            return;
        }

        await sendNewClassNotification(lecture);
    });

/**
 * Send notification when a lecture is updated from unpublished to published.
 */
export const onLectureUpdated = functions.firestore
    .document("lectures/{lectureId}")
    .onUpdate(async (change) => {
        const before = change.before.data();
        const after = change.after.data();

        // Only notify if published changed from false to true
        if (!before.published && after.published) {
            await sendNewClassNotification(after);
        }
    });

/**
 * Helper: Send multicast notification to all FCM tokens.
 */
async function sendNewClassNotification(lecture: admin.firestore.DocumentData) {
    const tokensSnapshot = await db.collection("fcmTokens").get();

    if (tokensSnapshot.empty) {
        console.log("No FCM tokens found");
        return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);

    const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
            title: "New Class Added 🚀",
            body: `${lecture.subject} — Lecture ${lecture.lectureNo}: ${lecture.title}`,
        },
        webpush: {
            fcmOptions: {
                link: "/dashboard",
            },
        },
    };

    try {
        const response = await messaging.sendEachForMulticast(message);
        console.log(`Sent: ${response.successCount}, Failed: ${response.failureCount}`);

        // Clean up invalid tokens
        if (response.failureCount > 0) {
            const tokensToRemove: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (
                    resp.error &&
                    (resp.error.code === "messaging/registration-token-not-registered" ||
                        resp.error.code === "messaging/invalid-registration-token")
                ) {
                    tokensToRemove.push(tokens[idx]);
                }
            });

            if (tokensToRemove.length > 0) {
                const batch = db.batch();
                const tokenQuery = await db
                    .collection("fcmTokens")
                    .where("token", "in", tokensToRemove)
                    .get();
                tokenQuery.docs.forEach((doc) => batch.delete(doc.ref));
                await batch.commit();
                console.log(`Removed ${tokensToRemove.length} invalid tokens`);
            }
        }
    } catch (error) {
        console.error("Error sending notifications:", error);
    }
}
