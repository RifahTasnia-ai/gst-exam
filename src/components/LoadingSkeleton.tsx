"use client";

export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card" style={{ overflow: "hidden" }}>
                    {/* Thumbnail skeleton */}
                    <div
                        className="animate-skeleton"
                        style={{
                            aspectRatio: "16/9",
                            background: "#E2E8F0",
                            width: "100%",
                        }}
                    />
                    {/* Body skeleton */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <div
                                className="animate-skeleton"
                                style={{
                                    width: "70px",
                                    height: "24px",
                                    borderRadius: "9999px",
                                    background: "#E2E8F0",
                                }}
                            />
                            <div
                                className="animate-skeleton"
                                style={{
                                    width: "80px",
                                    height: "16px",
                                    borderRadius: "8px",
                                    background: "#E2E8F0",
                                }}
                            />
                        </div>
                        <div
                            className="animate-skeleton"
                            style={{
                                width: "90%",
                                height: "20px",
                                borderRadius: "8px",
                                background: "#E2E8F0",
                            }}
                        />
                        <div
                            className="animate-skeleton"
                            style={{
                                width: "120px",
                                height: "36px",
                                borderRadius: "12px",
                                background: "#E2E8F0",
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
