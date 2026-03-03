"use client";

import { useState, useEffect } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

export default function NewClassBanner({ hasNewClasses }: { hasNewClasses: boolean }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (hasNewClasses) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                localStorage.setItem("lastVisitedAt", Date.now().toString());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [hasNewClasses]);

    const dismiss = () => {
        setVisible(false);
        localStorage.setItem("lastVisitedAt", Date.now().toString());
    };

    if (!visible) return null;

    return (
        <div
            className="animate-slide-down"
            style={{
                background: "var(--color-primary-light)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                border: "1.5px solid var(--color-primary)",
            }}
        >
            <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                🆕 New classes added!
            </span>
            <button
                onClick={dismiss}
                aria-label="Dismiss new class banner"
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-primary)",
                    padding: "4px",
                }}
            >
                <HiOutlineXMark size={20} />
            </button>
        </div>
    );
}
