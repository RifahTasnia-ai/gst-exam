"use client";

interface ProgressBarProps {
    completed: number;
    total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const allDone = completed > 0 && completed === total;

    return (
        <div className="card" style={{ padding: "16px" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", margin: "0 0 10px" }}>
                Your Progress
            </p>
            <div
                style={{
                    background: "#f1f5f9",
                    borderRadius: "4px",
                    height: "8px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        background: allDone ? "var(--color-success)" : "var(--color-primary)",
                        height: "100%",
                        borderRadius: "4px",
                        width: `${percentage}%`,
                        transition: "width 0.4s ease-out",
                    }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                    fontSize: "0.8125rem",
                }}
            >
                <span style={{ color: "var(--color-text-secondary)" }}>
                    {completed} of {total} completed
                </span>
                {allDone ? (
                    <span style={{ color: "var(--color-success)", fontWeight: 600 }}>🎉 All Done!</span>
                ) : (
                    <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{percentage}%</span>
                )}
            </div>
        </div>
    );
}
