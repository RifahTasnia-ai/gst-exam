"use client";

import { useState } from "react";
import { HiOutlineBell } from "react-icons/hi2";
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
            className="card animate-slide-down"
            style={{
                padding: "16px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
            }}
        >
            <div
                style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "var(--color-primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <HiOutlineBell size={22} color="var(--color-primary)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>
                    🔔 Get notified when new classes are added?
                </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                    onClick={handleDismiss}
                    aria-label="Dismiss notification prompt"
                    style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1.5px solid var(--color-border)",
                        background: "transparent",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    Not now
                </button>
                <button
                    onClick={handleEnable}
                    disabled={loading}
                    aria-label="Enable notifications"
                    style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: "var(--color-primary)",
                        color: "white",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? "..." : "Enable"}
                </button>
            </div>
        </div>
    );
}
