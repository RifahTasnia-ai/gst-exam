"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    User,
} from "firebase/auth";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { extractVideoId, getThumbnailUrl, fetchVideoTitle } from "@/lib/youtube";
import { subjects } from "@/lib/utils";
import toast from "react-hot-toast";

import AnimatedBackground from "@/components/AnimatedBackground";
import AdminLectureItem from "@/components/AdminLectureItem";
import { Lecture } from "@/components/LectureCard";
import {
    HiOutlineArrowRightOnRectangle,
    HiOutlinePlusCircle,
    HiOutlineQueueList,
    HiOutlineMagnifyingGlass,
} from "react-icons/hi2";

export default function AdminPanel() {
    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState("abc@gmail.com");
    const [password, setPassword] = useState("abc@123");
    const [loginLoading, setLoginLoading] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<"add" | "manage">("add");

    // Add form
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [videoId, setVideoId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [lectureNo, setLectureNo] = useState<number | "">("");
    const [subject, setSubject] = useState<string>(subjects[0]);
    const [published, setPublished] = useState(true);
    const [publishing, setPublishing] = useState(false);

    // Manage state
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editLectureNo, setEditLectureNo] = useState<number | "">("");
    const [editSubject, setEditSubject] = useState<string>(subjects[0]);
    const [editPublished, setEditPublished] = useState(true);

    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return () => unsub();
    }, []);

    // Fetch all lectures for admin
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "lectures"), orderBy("sortOrder", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const data: Lecture[] = snapshot.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Lecture, "id">),
            }));
            setLectures(data);
        });

        return () => unsub();
    }, [user]);

    // Extract video ID on URL change
    useEffect(() => {
        const id = extractVideoId(youtubeUrl);
        setVideoId(id);
        if (id) {
            fetchVideoTitle(id).then((t) => setTitle(t));
        }
    }, [youtubeUrl]);

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        try {
            // Test Mode Bypass
            if (email.trim() === "abc@gmail.com" && password === "abc@123") {
                setUser({ email: "abc@gmail.com", uid: "mock-admin-id" } as User);
                toast.success("Logged in! ✅ (Test Mode)");
                return;
            }
            await signInWithEmailAndPassword(auth, email.trim(), password);
            toast.success("Logged in! ✅");
        } catch {
            toast.error("Invalid credentials");
        } finally {
            setLoginLoading(false);
        }
    };

    // Publish handler
    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoId) { toast.error("Invalid YouTube URL"); return; }
        if (!title.trim()) { toast.error("Title is required"); return; }
        if (!lectureNo) { toast.error("Lecture number is required"); return; }

        setPublishing(true);
        try {
            await addDoc(collection(db, "lectures"), {
                youtubeId: videoId,
                title: title.trim(),
                thumbnail: getThumbnailUrl(videoId),
                lectureNo: Number(lectureNo),
                subject,
                published,
                createdAt: serverTimestamp(),
                sortOrder: Date.now(),
            });
            toast.success("Class published! 🚀");
            // Clear form
            setYoutubeUrl("");
            setVideoId(null);
            setTitle("");
            setLectureNo("");
            setSubject(subjects[0]);
            setPublished(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to publish");
        } finally {
            setPublishing(false);
        }
    };

    // Delete handler
    const handleDelete = async (lectureId: string) => {
        try {
            await deleteDoc(doc(db, "lectures", lectureId));
            toast.success("Deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    // Toggle publish handler
    const handleTogglePublish = async (lectureId: string, currentPublished: boolean) => {
        try {
            await updateDoc(doc(db, "lectures", lectureId), { published: !currentPublished });
            toast.success(currentPublished ? "Unpublished" : "Published ✅");
        } catch {
            toast.error("Failed to update");
        }
    };

    // Edit handler
    const handleEdit = (lecture: Lecture) => {
        setEditingLecture(lecture);
        setEditTitle(lecture.title);
        setEditLectureNo(lecture.lectureNo);
        setEditSubject(lecture.subject);
        setEditPublished(lecture.published);
    };

    // Save edit handler
    const handleSaveEdit = async () => {
        if (!editingLecture) return;
        try {
            await updateDoc(doc(db, "lectures", editingLecture.id), {
                title: editTitle.trim(),
                lectureNo: Number(editLectureNo),
                subject: editSubject,
                published: editPublished,
            });
            toast.success("Updated ✅");
            setEditingLecture(null);
        } catch {
            toast.error("Failed to update");
        }
    };

    // Filter lectures by search
    const filteredLectures = lectures.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Loading state
    if (authLoading) {
        return (
            <>
                <AnimatedBackground />
                <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                    <div className="animate-skeleton" style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#E2E8F0" }} />
                </main>
            </>
        );
    }

    // Login screen
    if (!user) {
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
                    <div className="card card-md" style={{ width: "100%", maxWidth: "400px", padding: "40px 28px", textAlign: "center" }}>
                        <h1 style={{ color: "var(--color-primary)", fontWeight: 800, fontSize: "1.75rem", margin: "0 0 8px" }}>
                            Admin Login
                        </h1>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", margin: "0 0 28px" }}>
                            Sign in to manage classes
                        </p>
                        <form onSubmit={handleLogin}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                aria-label="Admin email"
                                className="input-field"
                                style={{ marginBottom: "12px" }}
                                required
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                aria-label="Admin password"
                                className="input-field"
                                style={{ marginBottom: "16px" }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="btn-primary"
                                style={{ width: "100%", padding: "14px", fontSize: "1rem", opacity: loginLoading ? 0.6 : 1 }}
                            >
                                {loginLoading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                </main>
            </>
        );
    }

    // Admin dashboard
    return (
        <>
            <AnimatedBackground />
            <main
                className="animate-fade-in"
                style={{
                    position: "relative",
                    zIndex: 1,
                    paddingTop: "48px",
                    paddingBottom: "96px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    maxWidth: "800px",
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <div>
                        <h1 style={{ fontWeight: 700, fontSize: "1.5rem", margin: 0 }}>Admin Panel</h1>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", margin: "2px 0 0" }}>
                            {user.email}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut(auth)}
                        aria-label="Logout"
                        style={{
                            background: "var(--color-danger-light)",
                            color: "var(--color-danger)",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                        }}
                    >
                        <HiOutlineArrowRightOnRectangle size={18} />
                        Logout
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                    <button
                        onClick={() => setActiveTab("add")}
                        className="chip"
                        style={{
                            background: activeTab === "add" ? "var(--color-primary)" : "var(--color-card)",
                            color: activeTab === "add" ? "white" : "var(--color-text-secondary)",
                            borderColor: activeTab === "add" ? "transparent" : "var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <HiOutlinePlusCircle size={16} /> Add New Class
                    </button>
                    <button
                        onClick={() => setActiveTab("manage")}
                        className="chip"
                        style={{
                            background: activeTab === "manage" ? "var(--color-primary)" : "var(--color-card)",
                            color: activeTab === "manage" ? "white" : "var(--color-text-secondary)",
                            borderColor: activeTab === "manage" ? "transparent" : "var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <HiOutlineQueueList size={16} /> Manage Classes
                    </button>
                </div>

                {/* TAB 1: Add New Class */}
                {activeTab === "add" && (
                    <div className="card card-md animate-fade-in" style={{ padding: "24px" }}>
                        <h2 style={{ fontWeight: 600, fontSize: "1.125rem", margin: "0 0 20px" }}>
                            Add New Class
                        </h2>
                        <form onSubmit={handlePublish}>
                            {/* YouTube URL */}
                            <label style={{ display: "block", marginBottom: "16px" }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                                    YouTube Link
                                </span>
                                <input
                                    type="text"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="Paste YouTube video URL"
                                    className="input-field"
                                />
                            </label>

                            {/* Preview */}
                            {videoId && (
                                <div className="animate-fade-in" style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden", border: "1.5px solid var(--color-border)" }}>
                                    <img
                                        src={getThumbnailUrl(videoId)}
                                        alt="Video preview"
                                        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                                    />
                                </div>
                            )}

                            {/* Title */}
                            <label style={{ display: "block", marginBottom: "16px" }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                                    Title
                                </span>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Video title"
                                    className="input-field"
                                    required
                                />
                            </label>

                            {/* Lecture No + Subject row */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                <label>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                                        Lecture #
                                    </span>
                                    <input
                                        type="number"
                                        value={lectureNo}
                                        onChange={(e) => setLectureNo(e.target.value ? Number(e.target.value) : "")}
                                        placeholder="#"
                                        className="input-field"
                                        min={1}
                                        required
                                    />
                                </label>
                                <label>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                                        Subject
                                    </span>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="input-field"
                                        style={{ cursor: "pointer" }}
                                    >
                                        {subjects.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {/* Published toggle */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Published</span>
                                <div
                                    role="switch"
                                    aria-checked={published}
                                    aria-label="Toggle published"
                                    tabIndex={0}
                                    className={`toggle-switch ${published ? "active" : ""}`}
                                    onClick={() => setPublished(!published)}
                                    onKeyDown={(e) => e.key === "Enter" && setPublished(!published)}
                                />
                            </div>

                            {/* Publish button */}
                            <button
                                type="submit"
                                disabled={publishing || !videoId}
                                className="btn-primary"
                                style={{ width: "100%", padding: "14px", fontSize: "1rem", opacity: publishing ? 0.6 : 1 }}
                            >
                                {publishing ? "Publishing..." : "Publish Class 🚀"}
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 2: Manage Classes */}
                {activeTab === "manage" && (
                    <div className="animate-fade-in">
                        {/* Search */}
                        <div style={{ position: "relative", marginBottom: "16px" }}>
                            <HiOutlineMagnifyingGlass
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--color-text-secondary)",
                                }}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title..."
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                            />
                        </div>

                        {/* Lectures list */}
                        {filteredLectures.length === 0 ? (
                            <div className="card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                                {lectures.length === 0
                                    ? "Add your first class above ☝️"
                                    : "No matching lectures found"}
                            </div>
                        ) : (
                            filteredLectures.map((lecture) => (
                                <AdminLectureItem
                                    key={lecture.id}
                                    lecture={lecture}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onTogglePublish={handleTogglePublish}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Edit Modal */}
                {editingLecture && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 50,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.4)",
                            padding: "20px",
                        }}
                        onClick={() => setEditingLecture(null)}
                    >
                        <div
                            className="card card-md animate-fade-in"
                            style={{ width: "100%", maxWidth: "440px", padding: "24px" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ fontWeight: 600, fontSize: "1.125rem", margin: "0 0 20px" }}>
                                Edit Lecture
                            </h3>

                            <label style={{ display: "block", marginBottom: "12px" }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>Title</span>
                                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field" />
                            </label>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                <label>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>Lecture #</span>
                                    <input type="number" value={editLectureNo} onChange={(e) => setEditLectureNo(e.target.value ? Number(e.target.value) : "")} className="input-field" min={1} />
                                </label>
                                <label>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>Subject</span>
                                    <select value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                                        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </label>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Published</span>
                                <div
                                    role="switch"
                                    aria-checked={editPublished}
                                    aria-label="Toggle published"
                                    tabIndex={0}
                                    className={`toggle-switch ${editPublished ? "active" : ""}`}
                                    onClick={() => setEditPublished(!editPublished)}
                                    onKeyDown={(e) => e.key === "Enter" && setEditPublished(!editPublished)}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    onClick={() => setEditingLecture(null)}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        borderRadius: "12px",
                                        border: "1.5px solid var(--color-border)",
                                        background: "transparent",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="btn-primary"
                                    style={{ flex: 1, padding: "12px" }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
