"use client";

export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card" style={{ padding: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Thumbnail skeleton */}
                    <div
                        className="animate-skeleton"
                        style={{
                            width: "80px",
                            height: "56px",
                            borderRadius: "6px",
                            background: "#e5e7eb",
                            flexShrink: 0,
                        }}
                    />
                    {/* Content skeleton */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div
                            className="animate-skeleton"
                            style={{
                                width: "60px",
                                height: "18px",
                                borderRadius: "4px",
                                background: "#e5e7eb",
                            }}
                        />
                        <div
                            className="animate-skeleton"
                            style={{
                                width: "85%",
                                height: "14px",
                                borderRadius: "4px",
                                background: "#e5e7eb",
                            }}
                        />
                    </div>
                    {/* Toggle button skeleton */}
                    <div
                        className="animate-skeleton"
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            background: "#e5e7eb",
                            flexShrink: 0,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
