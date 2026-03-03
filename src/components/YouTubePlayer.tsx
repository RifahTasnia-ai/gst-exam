"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const YouTube = dynamic(() => import("react-youtube"), { ssr: false });

interface YouTubePlayerProps {
    videoId: string;
    onClose?: () => void;
}

export default function YouTubePlayer({ videoId, onClose }: YouTubePlayerProps) {
    const [ready, setReady] = useState(false);

    return (
        <div className="animate-fade-in" style={{ position: "relative" }}>
            {!ready && (
                <div
                    className="animate-skeleton"
                    style={{
                        aspectRatio: "16/9",
                        background: "#1E293B",
                        borderRadius: "0",
                        width: "100%",
                    }}
                />
            )}
            <YouTube
                videoId={videoId}
                opts={{
                    width: "100%",
                    playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0,
                    },
                }}
                onReady={() => setReady(true)}
                style={{
                    display: ready ? "block" : "none",
                    width: "100%",
                    aspectRatio: "16/9",
                }}
                iframeClassName="w-full"
            />
            {onClose && (
                <button
                    onClick={onClose}
                    aria-label="Close video player"
                    style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        zIndex: 10,
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                    }}
                >
                    ✕
                </button>
            )}
        </div>
    );
}
