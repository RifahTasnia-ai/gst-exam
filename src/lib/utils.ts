import { Timestamp } from "firebase/firestore";

/**
 * Format a Firestore Timestamp into a relative time string.
 */
export function relativeTime(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return "";

    const now = Date.now();
    const then = timestamp.toMillis();
    const diff = now - then;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

/**
 * Subject color mapping — muted, professional tones.
 */
export const subjectColors: Record<string, { bg: string; text: string; bgLight: string }> = {
    Physics: { bg: "#2563eb", text: "#FFFFFF", bgLight: "#eff6ff" },
    Chemistry: { bg: "#9333ea", text: "#FFFFFF", bgLight: "#faf5ff" },
    Math: { bg: "#ca8a04", text: "#FFFFFF", bgLight: "#fefce8" },
    Biology: { bg: "#16a34a", text: "#FFFFFF", bgLight: "#f0fdf4" },
};

/**
 * List of all subjects.
 */
export const subjects = ["Physics", "Chemistry", "Math", "Biology"] as const;
export type Subject = (typeof subjects)[number];

/**
 * Generate a unique progress document ID.
 */
export function progressDocId(studentId: string, lectureId: string): string {
    return `${studentId}_${lectureId}`;
}
