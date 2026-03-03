"use client";

import { useState } from "react";
import { Lecture } from "./LectureCard";
import SubjectChip from "./SubjectChip";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

interface AdminLectureItemProps {
    lecture: Lecture;
    onEdit: (lecture: Lecture) => void;
    onDelete: (lectureId: string) => void;
    onTogglePublish: (lectureId: string, currentPublished: boolean) => void;
}

export default function AdminLectureItem({
    lecture,
    onEdit,
    onDelete,
    onTogglePublish,
}: AdminLectureItemProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (confirm(`Delete "${lecture.title}"? This cannot be undone.`)) {
            setDeleting(true);
            onDelete(lecture.id);
        }
    };

    return (
        <div
            className="card"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                marginBottom: "8px",
                opacity: deleting ? 0.5 : 1,
                transition: "opacity 0.15s",
            }}
        >
            {/* Small thumbnail */}
            <img
                src={lecture.thumbnail}
                alt={lecture.title}
                style={{
                    width: "80px",
                    height: "45px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    flexShrink: 0,
                }}
            />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                    style={{
                        margin: 0,
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {lecture.title}
                </h4>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "4px",
                    }}
                >
                    <SubjectChip subject={lecture.subject} size="sm" />
                    <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                        #{lecture.lectureNo}
                    </span>
                    <span
                        style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: lecture.published ? "var(--color-success)" : "var(--color-danger)",
                            marginLeft: "auto",
                        }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                <button
                    onClick={() => onEdit(lecture)}
                    aria-label="Edit lecture"
                    style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "none",
                        background: "var(--color-primary-light)",
                        color: "var(--color-primary)",
                        cursor: "pointer",
                    }}
                >
                    <HiOutlinePencil size={14} />
                </button>
                <button
                    onClick={() => onTogglePublish(lecture.id, lecture.published)}
                    aria-label={lecture.published ? "Unpublish lecture" : "Publish lecture"}
                    style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "none",
                        background: lecture.published ? "var(--color-success-light)" : "var(--color-danger-light)",
                        color: lecture.published ? "var(--color-success)" : "var(--color-danger)",
                        cursor: "pointer",
                    }}
                >
                    {lecture.published ? <HiOutlineEye size={14} /> : <HiOutlineEyeSlash size={14} />}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    aria-label="Delete lecture"
                    style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "none",
                        background: "var(--color-danger-light)",
                        color: "var(--color-danger)",
                        cursor: "pointer",
                    }}
                >
                    <HiOutlineTrash size={14} />
                </button>
            </div>
        </div>
    );
}
