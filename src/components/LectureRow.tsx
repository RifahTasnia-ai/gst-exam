"use client";

import { useRouter } from "next/navigation";
import { Lecture } from "./LectureCard";
import { subjectColors } from "@/lib/utils";
import { HiOutlinePlay } from "react-icons/hi2";

interface LectureRowProps {
    lecture: Lecture;
    isActive?: boolean;
}

export default function LectureRow({ lecture, isActive }: LectureRowProps) {
    const router = useRouter();
    const subjectColor = subjectColors[lecture.subject] ?? { bg: "#0f766e", text: "#FFFFFF", bgLight: "#f0fdfa" };

    return (
        <div
            onClick={() => router.push(`/lecture/${lecture.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && router.push(`/lecture/${lecture.id}`)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                cursor: "pointer",
                background: isActive ? "var(--color-primary-light)" : "transparent",
                borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
                transition: "background-color 0.15s",
            }}
        >
            {/* Thumbnail */}
            <div
                style={{
                    position: "relative",
                    width: "80px",
                    height: "56px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <img
                    src={lecture.thumbnail}
                    alt={lecture.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.28)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <HiOutlinePlay size={18} color="white" style={{ marginLeft: "2px" }} />
                </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        margin: "0 0 5px",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        lineHeight: 1.3,
                        color: isActive ? "var(--color-primary)" : "var(--color-text-primary)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {lecture.title}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    {/* YouTube badge */}
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "#FF0000",
                            color: "#fff",
                            fontSize: "0.625rem",
                            fontWeight: 600,
                            borderRadius: "3px",
                            padding: "2px 5px",
                        }}
                    >
                        ▶ YouTube
                    </span>
                    {/* Subject chip */}
                    <span
                        style={{
                            background: subjectColor.bgLight,
                            color: subjectColor.bg,
                            fontSize: "0.625rem",
                            fontWeight: 600,
                            borderRadius: "3px",
                            padding: "2px 5px",
                        }}
                    >
                        {lecture.subject}
                    </span>
                </div>
            </div>
        </div>
    );
}
