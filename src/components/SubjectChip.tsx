"use client";

import { subjectColors } from "@/lib/utils";

interface SubjectChipProps {
    subject: string;
    size?: "sm" | "md";
}

export default function SubjectChip({ subject, size = "sm" }: SubjectChipProps) {
    const colors = subjectColors[subject] || { bg: "#0f766e", text: "#FFF", bgLight: "#f0fdfa" };

    return (
        <span
            style={{
                background: colors.bgLight,
                color: colors.bg,
                padding: size === "sm" ? "2px 8px" : "4px 12px",
                borderRadius: "4px",
                fontSize: size === "sm" ? "0.6875rem" : "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
            }}
        >
            {subject}
        </span>
    );
}
