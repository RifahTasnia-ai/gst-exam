"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subjectColors } from "@/lib/utils";
import { Lecture } from "@/components/LectureCard";
import YouTubePlayer from "@/components/YouTubePlayer";
import LectureRow from "@/components/LectureRow";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function LectureDetailPage() {
    const params = useParams();
    const router = useRouter();
    const lectureId = params.id as string;

    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [allLectures, setAllLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch the specific lecture
    useEffect(() => {
        if (!lectureId) return;
        const fetchLecture = async () => {
            try {
                const docRef = doc(db, "lectures", lectureId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setLecture({ id: snap.id, ...(snap.data() as Omit<Lecture, "id">) });
                }
            } catch (err) {
                console.error("Error fetching lecture:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLecture();
    }, [lectureId]);

    // Fetch all other published lectures (real-time)
    useEffect(() => {
        const q = query(
            collection(db, "lectures"),
            where("published", "==", true),
            orderBy("sortOrder", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
            const data: Lecture[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Lecture, "id">),
            }));
            setAllLectures(data);
        });
        return () => unsub();
    }, []);

    const subjectColor = lecture
        ? (subjectColors[lecture.subject] ?? { bg: "#0f766e", text: "#FFFFFF", bgLight: "#f0fdfa" })
        : null;

    const youtubeUrl = lecture ? `https://www.youtube.com/watch?v=${lecture.youtubeId}` : "#";

    return (
        <div
            style={{
                maxWidth: "640px",
                margin: "0 auto",
                minHeight: "100dvh",
                paddingBottom: "60px",
                background: "var(--color-card)",
            }}
        >
            {/* ── Top Header Bar ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                }}
            >
                <button
                    onClick={() => router.back()}
                    aria-label="Go back"
                    style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                    }}
                >
                    <HiOutlineArrowLeft size={20} />
                </button>

                <h2
                    style={{
                        margin: 0,
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                    }}
                >
                    ক্লাস ভিডিও
                </h2>

                {/* YouTube red icon top-right */}
                <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open on YouTube"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        background: "#FF0000",
                        color: "#fff",
                        fontSize: "16px",
                        textDecoration: "none",
                    }}
                >
                    ▶
                </a>
            </div>

            {/* ── Loading state ── */}
            {loading && (
                <div
                    className="animate-skeleton"
                    style={{
                        aspectRatio: "16/9",
                        background: "#e5e7eb",
                        width: "100%",
                    }}
                />
            )}

            {/* ── Main content ── */}
            {!loading && lecture && (
                <div>
                    {/* YouTube Embedded Player */}
                    <YouTubePlayer videoId={lecture.youtubeId} />

                    {/* Meta + Title Section */}
                    <div style={{ padding: "14px 16px 0" }}>
                        {/* Tags row */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                flexWrap: "wrap",
                                marginBottom: "8px",
                            }}
                        >
                            {/* ক্লাস number chip */}
                            <span
                                style={{
                                    background: "var(--color-primary-light)",
                                    color: "var(--color-primary)",
                                    fontSize: "0.6875rem",
                                    fontWeight: 600,
                                    borderRadius: "4px",
                                    padding: "3px 8px",
                                }}
                            >
                                ক্লাস {lecture.lectureNo}
                            </span>

                            {/* Subject chip */}
                            {subjectColor && (
                                <span
                                    style={{
                                        background: subjectColor.bgLight,
                                        color: subjectColor.bg,
                                        fontSize: "0.6875rem",
                                        fontWeight: 600,
                                        borderRadius: "4px",
                                        padding: "3px 8px",
                                    }}
                                >
                                    {lecture.subject}
                                </span>
                            )}

                            {/* YouTube badge */}
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    background: "#FF0000",
                                    color: "#fff",
                                    fontSize: "0.6875rem",
                                    fontWeight: 600,
                                    borderRadius: "4px",
                                    padding: "3px 8px",
                                }}
                            >
                                ▶ YouTube
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            style={{
                                margin: "0 0 16px",
                                fontSize: "1.125rem",
                                fontWeight: 700,
                                lineHeight: 1.4,
                                color: "var(--color-text-primary)",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {lecture.title}
                        </h1>

                        {/* CTA Button — YouTube-এ দেখুন */}
                        <a
                            href={youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                background: "#FF0000",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "0.9375rem",
                                textDecoration: "none",
                                marginBottom: "20px",
                                transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            <span style={{ fontSize: "16px" }}>▶</span>
                            YouTube-এ দেখুন
                        </a>
                    </div>

                    {/* ── সকল ক্লাস Section ── */}
                    <div>
                        {/* Section header */}
                        <div
                            style={{
                                padding: "0 16px 10px",
                                borderBottom: "1px solid var(--color-border)",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "var(--color-text-secondary)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    textAlign: "center",
                                }}
                            >
                                সকল ক্লাস
                            </p>
                        </div>

                        {/* List */}
                        <div>
                            {allLectures.length === 0 ? (
                                <p style={{ textAlign: "center", padding: "24px", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                    কোনো ক্লাস নেই
                                </p>
                            ) : (
                                allLectures.map((lec, i) => (
                                    <div key={lec.id}>
                                        <LectureRow
                                            lecture={lec}
                                            isActive={lec.id === lectureId}
                                        />
                                        {i < allLectures.length - 1 && (
                                            <div style={{ height: "1px", background: "var(--color-border)", margin: "0 16px" }} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Not found */}
            {!loading && !lecture && (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <p style={{ fontSize: "2rem" }}>😕</p>
                    <p style={{ color: "var(--color-text-secondary)" }}>ক্লাস পাওয়া যায়নি</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="btn-primary"
                        style={{ marginTop: "16px", padding: "8px 20px" }}
                    >
                        ড্যাশবোর্ডে যান
                    </button>
                </div>
            )}
        </div>
    );
}
