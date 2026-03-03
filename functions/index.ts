import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
const MAX_MULTICAST_TOKENS = 500;
const MAX_BATCH_WRITES = 500;

type LectureData = {
    published?: boolean;
    subject?: string;
    lectureNo?: string | number;
    title?: string;
};

type TokenRecord = {
    token: string;
    ref: FirebaseFirestore.DocumentReference;
};

/**
 * Send notification to all registered devices when a new lecture is published.
 */
export const onNewLecturePublished = functions.firestore
    .document("lectures/{lectureId}")
    .onCreate(async (snapshot) => {
        const lecture = snapshot.data() as LectureData;

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
        const before = change.before.data() as LectureData;
        const after = change.after.data() as LectureData;

        // Only notify if published changed from false to true.
        if (!before.published && after.published) {
            await sendNewClassNotification(after);
        }
    });

/**
 * Helper: Send multicast notification to all FCM tokens.
 */
async function sendNewClassNotification(lecture: LectureData) {
    const tokensSnapshot = await db.collection("fcmTokens").get();

    if (tokensSnapshot.empty) {
        console.log("No FCM tokens found");
        return;
    }

    const tokenRecords = tokensSnapshot.docs
        .map((doc) => ({
            token: doc.get("token") as unknown,
            ref: doc.ref,
        }))
        .filter(
            (record): record is TokenRecord =>
                typeof record.token === "string" &&
                record.token.trim().length > 0,
        );

    if (tokenRecords.length === 0) {
        console.log("No valid FCM tokens found");
        return;
    }

    const subject = lecture.subject ?? "New Class";
    const lectureNo = lecture.lectureNo ?? "-";
    const title = lecture.title ?? "Untitled";
    const notificationBody = `${subject} - Lecture ${lectureNo}: ${title}`;

    try {
        let totalSuccess = 0;
        let totalFailures = 0;
        const refsToDelete: FirebaseFirestore.DocumentReference[] = [];

        for (
            let start = 0;
            start < tokenRecords.length;
            start += MAX_MULTICAST_TOKENS
        ) {
            const chunk = tokenRecords.slice(start, start + MAX_MULTICAST_TOKENS);
            const message: admin.messaging.MulticastMessage = {
                tokens: chunk.map((record) => record.token),
                notification: {
                    title: "নতুন ক্লাস যোগ হয়েছে! 📚",
                    body: `${subject} — Lecture ${lectureNo}: ${title}`,
                },
                webpush: {
                    notification: {
                        icon: "/icons/icon-192x192.png",
                        badge: "/icons/icon-72x72.png",
                        vibrate: [200, 100, 200],
                    },
                    fcmOptions: {
                        link: "/dashboard",
                    },
                },
            };

            const response = await messaging.sendEachForMulticast(message);
            totalSuccess += response.successCount;
            totalFailures += response.failureCount;

            response.responses.forEach((resp, idx) => {
                if (
                    resp.error &&
                    (resp.error.code ===
                        "messaging/registration-token-not-registered" ||
                        resp.error.code === "messaging/invalid-registration-token")
                ) {
                    refsToDelete.push(chunk[idx].ref);
                }
            });
        }

        console.log(`Sent: ${totalSuccess}, Failed: ${totalFailures}`);

        if (refsToDelete.length > 0) {
            for (
                let start = 0;
                start < refsToDelete.length;
                start += MAX_BATCH_WRITES
            ) {
                const batch = db.batch();
                const deleteChunk = refsToDelete.slice(
                    start,
                    start + MAX_BATCH_WRITES,
                );
                deleteChunk.forEach((ref) => batch.delete(ref));
                await batch.commit();
            }

            console.log(`Removed ${refsToDelete.length} invalid tokens`);
        }
    } catch (error) {
        console.error("Error sending notifications:", error);
    }
}
