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
      toast.error("Please enter your Student ID");
      return;
    }
    localStorage.setItem("gst_student_id", trimmed);
    router.push("/dashboard");
  };

  return (
    <>
      <AnimatedBackground />
      <main
        className="animate-fade-in"
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          className="card card-md"
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "40px 28px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <h1
            style={{
              color: "var(--color-primary)",
              fontWeight: 800,
              fontSize: "2rem",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            GST Exam
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9375rem",
              margin: "0 0 32px",
            }}
          >
            Enter your Student ID to continue
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
              aria-label="Student ID"
              className="input-field"
              style={{
                textAlign: "center",
                fontSize: "1.25rem",
                letterSpacing: "0.05em",
                padding: "16px",
                marginBottom: "16px",
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!studentId.trim()}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "1.0625rem",
              }}
            >
              Enter
            </button>
          </form>

          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.8125rem",
              marginTop: "20px",
            }}
          >
            No password required
          </p>
        </div>
      </main>
    </>
  );
}
