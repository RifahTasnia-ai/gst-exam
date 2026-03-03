"use client";

import { useState } from "react";
import { HiOutlineBell, HiOutlineXMark } from "react-icons/hi2";
import { requestNotificationPermission, wasNotifDismissed, dismissNotifPrompt } from "@/lib/fcm";

interface NotificationPromptProps {
    studentId: string;
}

export default function NotificationPrompt({ studentId }: NotificationPromptProps) {
    const [visible, setVisible] = useState(() => {
        if (typeof window === "undefined") return false;
        if (wasNotifDismissed()) return false;
        if (localStorage.getItem("fcm_token")) return false;
        return true;
    });
    const [loading, setLoading] = useState(false);

    const handleEnable = async () => {
        setLoading(true);
        await requestNotificationPermission(studentId);
        setLoading(false);
        setVisible(false);
    };

    const handleDismiss = () => {
        dismissNotifPrompt();
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            className="card"
            style={{
                marginBottom: "16px",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                {/* Bell icon */}
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "6px",
                        background: "var(--color-primary-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <HiOutlineBell size={18} color="var(--color-primary)" />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.8125rem", margin: "0 0 1px", color: "var(--color-text-primary)" }}>
                        নতুন ক্লাস নোটিফিকেশন চালু করো
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: 0 }}>
                        নতুন ক্লাস এলেই সাথে সাথে জানতে পারবে
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button
                        onClick={handleEnable}
                        disabled={loading}
                        aria-label="নোটিফিকেশন চালু করো"
                        className="btn-primary"
                        style={{
                            padding: "6px 12px",
                            fontSize: "0.8125rem",
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? "..." : "চালু করো"}
                    </button>
                    <button
                        onClick={handleDismiss}
                        aria-label="বাদ দাও"
                        style={{
                            padding: "4px",
                            borderRadius: "6px",
                            border: "none",
                            background: "transparent",
                            color: "var(--color-text-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <HiOutlineXMark size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
