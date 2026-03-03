"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("Rifah");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentId.trim();
    if (!trimmed) {
      toast.error("আপনার স্টুডেন্ট আইডি দিন");
      return;
    }
    localStorage.setItem("gst_student_id", trimmed);
    router.push("/dashboard");
  };

  return (
    <>
      <AnimatedBackground />
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#fafafa",
        }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: "380px",
            textAlign: "center",
            padding: "32px 24px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "8px",
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              color: "var(--color-text-primary)",
              fontWeight: 700,
              fontSize: "1.5rem",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            GST Preparation Class
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.875rem",
              margin: "0 0 24px",
              lineHeight: 1.5,
            }}
          >
            তোমার স্টুডেন্ট আইডি দিয়ে প্রবেশ করো
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="স্টুডেন্ট আইডি লিখুন"
              aria-label="Student ID"
              className="input-field"
              style={{
                textAlign: "center",
                letterSpacing: "0.03em",
                marginBottom: "12px",
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!studentId.trim()}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "10px 20px",
                fontSize: "0.9375rem",
              }}
            >
              প্রবেশ করো
            </button>
          </form>

          <p
            style={{
              color: "var(--color-text-secondary)",
              marginTop: "14px",
              fontSize: "0.75rem",
            }}
          >
            কোনো পাসওয়ার্ড লাগবে না
          </p>
        </div>
      </main>
    </>
  );
}
