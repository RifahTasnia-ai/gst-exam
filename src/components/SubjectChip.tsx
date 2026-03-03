"use client";

import { subjectColors } from "@/lib/utils";

interface SubjectChipProps {
    subject: string;
    size?: "sm" | "md";
}

export default function SubjectChip({ subject, size = "sm" }: SubjectChipProps) {
    const colors = subjectColors[subject] || { bg: "#6C63FF", text: "#FFF" };

    return (
        <span
            style={{
                background: colors.bg,
                color: colors.text,
                padding: size === "sm" ? "3px 10px" : "6px 14px",
                borderRadius: "9999px",
                fontSize: size === "sm" ? "0.75rem" : "0.8125rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
            }}
        >
            {subject}
        </span>
    );
}
