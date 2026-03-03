"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import SubjectChip from "./SubjectChip";
import YouTubePlayer from "./YouTubePlayer";
import { relativeTime } from "@/lib/utils";
import { HiOutlinePlay, HiCheck } from "react-icons/hi2";

export interface Lecture {
    id: string;
    youtubeId: string;
    title: string;
    thumbnail: string;
    lectureNo: number;
    subject: string;
    createdAt: Timestamp | null;
    published: boolean;
    sortOrder: number;
}

interface LectureCardProps {
    lecture: Lecture;
    isDone: boolean;
    doneAt?: Timestamp | null;
    onToggleDone: (lectureId: string, currentlyDone: boolean) => void;
}

export default function LectureCard({ lecture, isDone, doneAt, onToggleDone }: LectureCardProps) {
    const [showPlayer, setShowPlayer] = useState(false);
    const [toggling, setToggling] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setToggling(true);
        await onToggleDone(lecture.id, isDone);
        setToggling(false);
    };

    return (
        <div className="card animate-fade-up" style={{ overflow: "hidden", marginBottom: "10px" }}>
            {/* Expanded YouTube player */}
            {showPlayer && (
                <YouTubePlayer videoId={lecture.youtubeId} onClose={() => setShowPlayer(false)} />
            )}

            {/* Compact row layout */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                }}
            >
                {/* Small thumbnail with play button */}
                <div
                    onClick={() => setShowPlayer(!showPlayer)}
                    role="button"
                    aria-label={`Play ${lecture.title}`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setShowPlayer(!showPlayer)}
                    style={{
                        position: "relative",
                        width: "80px",
                        height: "56px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        flexShrink: 0,
                        cursor: "pointer",
                    }}
                >
                    <img
                        src={lecture.thumbnail}
                        alt={lecture.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.3)",
                        }}
                    >
                        <HiOutlinePlay size={20} color="white" style={{ marginLeft: "2px" }} />
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                        <SubjectChip subject={lecture.subject} size="sm" />
                        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.7rem" }}>
                            #{lecture.lectureNo}
                        </span>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {lecture.title}
                    </p>
                </div>

                {/* Done toggle button */}
                <button
                    onClick={handleToggle}
                    disabled={toggling}
                    aria-label={isDone ? "Undo mark as done" : "Mark as done"}
                    className={isDone && !toggling ? "animate-bounce-scale" : ""}
                    style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        border: isDone ? "none" : "1.5px solid var(--color-border)",
                        background: isDone ? "var(--color-success)" : "transparent",
                        color: isDone ? "white" : "var(--color-text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        opacity: toggling ? 0.5 : 1,
                    }}
                >
                    <HiCheck size={18} />
                </button>
            </div>

            {/* Done info text (only if done) */}
            {isDone && doneAt && (
                <div
                    style={{
                        padding: "0 12px 8px",
                        fontSize: "0.7rem",
                        color: "var(--color-success)",
                        textAlign: "right",
                    }}
                >
                    ✅ {relativeTime(doneAt)}
                </div>
            )}
        </div>
    );
}
