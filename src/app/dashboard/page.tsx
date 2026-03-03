"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { progressDocId, subjects, subjectColors } from "@/lib/utils";
import toast from "react-hot-toast";

import AnimatedBackground from "@/components/AnimatedBackground";
import OfflineIndicator from "@/components/OfflineIndicator";
import NewClassBanner from "@/components/NewClassBanner";
import NotificationPrompt from "@/components/NotificationPrompt";
import ProgressBar from "@/components/ProgressBar";
import LectureCard, { Lecture } from "@/components/LectureCard";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import LoadingSkeleton from "@/components/LoadingSkeleton";

interface ProgressDoc {
    lectureId: string;
    doneAt: Timestamp | null;
}

export default function Dashboard() {
    const router = useRouter();
    const [studentId, setStudentId] = useState<string>("");
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [progressMap, setProgressMap] = useState<Map<string, ProgressDoc>>(new Map());
    const [activeFilter, setActiveFilter] = useState<string>("All");
    const [loading, setLoading] = useState(true);
    const [hasNewClasses, setHasNewClasses] = useState(false);

    // Auth check
    useEffect(() => {
        const id = localStorage.getItem("gst_student_id");
        if (!id) {
            router.push("/");
            return;
        }
        setStudentId(id);
    }, [router]);

    // Fetch lectures (real-time)
    useEffect(() => {
        if (!studentId) return;

        const q = query(
            collection(db, "lectures"),
            orderBy("sortOrder", "desc")
        );

        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const data: Lecture[] = snapshot.docs
                    .map((d) => ({
                        id: d.id,
                        ...(d.data() as Omit<Lecture, "id">),
                    }))
                    .filter((l) => l.published === true);
                setLectures(data);
                setLoading(false);

                // Check for new classes
                const lastVisited = localStorage.getItem("lastVisitedAt");
                if (lastVisited) {
                    const lastTs = parseInt(lastVisited, 10);
                    const hasNew = data.some((l) => l.createdAt && l.createdAt.toMillis() > lastTs);
                    setHasNewClasses(hasNew);
                }
            },
            (error) => {
                console.error("Error fetching lectures:", error);
                setLoading(false);
                toast.error("Failed to load lectures");
            }
        );

        return () => unsub();
    }, [studentId]);

    // Fetch progress (real-time)
    useEffect(() => {
        if (!studentId) return;

        const q = query(
            collection(db, "progress"),
            where("studentId", "==", studentId)
        );

        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const map = new Map<string, ProgressDoc>();
                snapshot.docs.forEach((d) => {
                    const data = d.data();
                    map.set(data.lectureId, {
                        lectureId: data.lectureId,
                        doneAt: data.doneAt || null,
                    });
                });
                setProgressMap(map);
            },
            (error) => {
                console.error("Error fetching progress:", error);
            }
        );

        return () => unsub();
    }, [studentId]);

    // Toggle done
    const handleToggleDone = useCallback(
        async (lectureId: string, currentlyDone: boolean) => {
            try {
                const docId = progressDocId(studentId, lectureId);
                const docRef = doc(db, "progress", docId);

                if (currentlyDone) {
                    await deleteDoc(docRef);
                    toast.success("Unmarked ↩️");
                } else {
                    await setDoc(docRef, {
                        studentId,
                        lectureId,
                        done: true,
                        doneAt: serverTimestamp(),
                    });
                    toast.success("Marked as done! ✅");
                }
            } catch (error) {
                console.error("Error toggling progress:", error);
                toast.error("Something went wrong");
            }
        },
        [studentId]
    );

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("gst_student_id");
        router.push("/");
    };


    // Filter lectures
    const filteredLectures =
        activeFilter === "All"
            ? lectures
            : lectures.filter((l) => l.subject === activeFilter);

    const completedCount = lectures.filter((l) => progressMap.has(l.id)).length;

    const filters = ["All", ...subjects];

    return (
        <>
            <AnimatedBackground />
            <OfflineIndicator />
            <main
                className="animate-fade-in"
                style={{
                    position: "relative",
                    zIndex: 1,
                    paddingTop: "48px",
                    paddingBottom: "96px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    maxWidth: "640px",
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h1 style={{ fontWeight: 700, fontSize: "1.5rem", margin: 0 }}>
                        Hi {studentId} 👋
                    </h1>
                    <button
                        onClick={handleLogout}
                        aria-label="Logout"
                        style={{
                            background: "var(--color-danger-light)",
                            color: "var(--color-danger)",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                        }}
                    >
                        <HiOutlineArrowRightOnRectangle size={18} />
                    </button>
                </div>

                {/* Notification Prompt */}
                {studentId && <NotificationPrompt studentId={studentId} />}

                {/* New Class Banner */}
                <NewClassBanner hasNewClasses={hasNewClasses} />

                {/* Progress Card */}
                <div style={{ marginBottom: "20px" }}>
                    <ProgressBar completed={completedCount} total={lectures.length} />
                </div>

                {/* Filter Chips */}
                <div
                    className="no-scrollbar"
                    style={{
                        display: "flex",
                        gap: "8px",
                        overflowX: "auto",
                        marginBottom: "20px",
                        paddingBottom: "4px",
                    }}
                >
                    {filters.map((f) => {
                        const isActive = f === activeFilter;
                        const chipBg =
                            f === "All"
                                ? isActive
                                    ? "var(--color-primary)"
                                    : "var(--color-card)"
                                : isActive
                                    ? subjectColors[f]?.bg || "var(--color-primary)"
                                    : "var(--color-card)";
                        const chipColor = isActive ? "#FFFFFF" : "var(--color-text-secondary)";

                        return (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                aria-label={`Filter by ${f}`}
                                className="chip"
                                style={{
                                    background: chipBg,
                                    color: f === "Math" && isActive ? "#1E293B" : chipColor,
                                    borderColor: isActive ? "transparent" : "var(--color-border)",
                                }}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>

                {/* Lectures Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "14px",
                    }}
                >
                    <h2 style={{ fontWeight: 600, fontSize: "1.125rem", margin: 0 }}>Lectures</h2>
                    <span
                        style={{
                            background: "var(--color-primary-light)",
                            color: "var(--color-primary)",
                            borderRadius: "9999px",
                            padding: "2px 10px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                        }}
                    >
                        {filteredLectures.length}
                    </span>
                </div>

                {/* Lecture List */}
                {loading ? (
                    <LoadingSkeleton count={3} />
                ) : filteredLectures.length === 0 ? (
                    <div
                        className="card"
                        style={{
                            padding: "40px 20px",
                            textAlign: "center",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        {activeFilter !== "All"
                            ? `No ${activeFilter} lectures found`
                            : "No classes yet! Check back soon 📚"}
                    </div>
                ) : (
                    <div className="lecture-grid">
                        {filteredLectures.map((lecture) => (
                            <LectureCard
                                key={lecture.id}
                                lecture={lecture}
                                isDone={progressMap.has(lecture.id)}
                                doneAt={progressMap.get(lecture.id)?.doneAt}
                                onToggleDone={handleToggleDone}
                            />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
