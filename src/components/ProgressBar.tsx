"use client";

interface ProgressBarProps {
    completed: number;
    total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const allDone = completed > 0 && completed === total;

    return (
        <div className="card p-5">
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", marginBottom: "10px" }}>
                Your Progress
            </p>
            <div
                style={{
                    background: "#F1F5F9",
                    borderRadius: "9999px",
                    height: "12px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        background: allDone ? "var(--color-success)" : "var(--color-primary)",
                        height: "100%",
                        borderRadius: "9999px",
                        width: `${percentage}%`,
                        transition: "width 0.5s ease-out",
                    }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                    fontSize: "0.875rem",
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
