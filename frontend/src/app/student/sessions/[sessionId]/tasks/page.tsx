"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";

interface Task {
  _id: string;
  sessionId: string;
  title: string;
  instructions: string;
  expectedOutput?: string;
  starterCode?: string;
  evaluationCriteria?: string;
  maxScore?: number;
  deadline?: string;
  status?: string;
  createdAt?: string;
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", dot: "#10B981" },
    error: { bg: "rgba(179,0,23,0.12)", border: "rgba(179,0,23,0.35)", dot: "#B30017" },
    info: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", dot: "#3B82F6" },
  };
  const c = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 20px",
        borderRadius: "12px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "slideInToast 0.3s ease forwards",
        fontFamily: "'Space Grotesk', sans-serif",
        maxWidth: "360px",
      }}
    >
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.dot, boxShadow: `0 0 8px ${c.dot}`, flexShrink: 0 }} />
      <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#FFFFFF", flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "16px", padding: 0 }}>×</button>
    </div>
  );
}

function TaskCard({
  task,
  active,
  onClick,
  index,
}: {
  task: Task;
  active: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        background: active ? "rgba(179,0,23,0.1)" : "transparent",
        borderLeft: `3px solid ${active ? "#B30017" : "transparent"}`,
        transition: "all 0.18s ease",
        animationDelay: `${index * 50}ms`,
        animation: "fadeUp 0.4s ease forwards",
        opacity: 0,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: active ? "rgba(179,0,23,0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${active ? "rgba(179,0,23,0.35)" : "rgba(255,255,255,0.08)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: 700,
            color: active ? "#B30017" : "#9CA3AF",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "13.5px",
              fontWeight: active ? 700 : 600,
              color: active ? "#FFFFFF" : "#E5E7EB",
              margin: 0,
              fontFamily: "'Space Grotesk', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.title}
          </p>
          <p
            style={{
              fontSize: "11.5px",
              color: "#9CA3AF",
              margin: "4px 0 0",
              fontFamily: "'Space Grotesk', sans-serif",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              lineHeight: 1.4,
            }}
          >
            {task.instructions}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudentTasksPage() {
  // ✅ FIX #1: useParams called INSIDE the component
  const params = useParams();
  const SESSION_ID = params.sessionId as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info") =>
    setToast({ message, type });

  const loadTasks = async () => {
    try {
      const response = await api.get(`/task/session/${SESSION_ID}`);
      const fetched = response.data.tasks || [];
      setTasks(fetched);

      // ✅ FIX #4: Auto-select first task
      if (fetched.length > 0) {
        setSelectedTask(fetched[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!SESSION_ID) return;

    loadTasks();

    socket.connect();

    // ✅ FIX #2: Emit student_join with session ID
    socket.emit("student_join", SESSION_ID);

    socket.on("task_created", (task: Task) => {
      // ✅ FIX #2: Filter by session ID
      if (task.sessionId === SESSION_ID) {
        setTasks((prev) => [task, ...prev]);
        showToast(`New task assigned: ${task.title}`, "info");
      }
    });

    return () => {
      socket.off("task_created");
    };
  }, [SESSION_ID]);

  const submitTask = async () => {
    if (!selectedTask || !file) {
      showToast("Please select a file before submitting.", "error");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // ✅ FIX #5: Append sessionId to submission
      formData.append("file", file);
      formData.append("taskId", selectedTask._id);
      formData.append("sessionId", SESSION_ID);

      await api.post("/submission/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadSuccess(true);
      setFile(null);
      showToast("Submission uploaded successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) { setFile(dropped); setUploadSuccess(false); }
  };

  const copyCode = () => {
    if (selectedTask?.starterCode) {
      navigator.clipboard.writeText(selectedTask.starterCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHTML =
    selectedTask?.expectedOutput?.includes("<html") ||
    selectedTask?.expectedOutput?.includes("<div") ||
    selectedTask?.expectedOutput?.includes("<header");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
            Student
          </p>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Tasks
          </h1>
        </div>

        {/* ✅ FIX #9: Responsive grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 900 ? "1fr" : "320px 1fr",
          gap: "16px",
          alignItems: "start",
        }}>

          {/* LEFT — Task List */}
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease 0.08s forwards",
              opacity: 0,
              position: "sticky",
              top: "76px",
              maxHeight: "calc(100vh - 110px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                Available Tasks
              </p>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(179,0,23,0.12)",
                  border: "1px solid rgba(179,0,23,0.25)",
                  fontSize: "11px",
                  color: "#B30017",
                  fontWeight: 600,
                }}
              >
                {tasks.length}
              </span>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {tasks.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", gap: "10px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: "18px" }}>
                    ⊞
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#9CA3AF", margin: 0, textAlign: "center" }}>No tasks yet</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: 0, textAlign: "center" }}>New tasks will appear here automatically</p>
                </div>
              ) : (
                tasks.map((task, i) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    active={selectedTask?._id === task._id}
                    onClick={() => { setSelectedTask(task); setUploadSuccess(false); setFile(null); }}
                    index={i}
                  />
                ))
              )}
            </div>
          </div>

          {/* RIGHT — Task Detail */}
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease 0.14s forwards",
              opacity: 0,
            }}
          >
            {!selectedTask ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: "14px" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.15)",
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Select a task to get started</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: 0 }}>Your task details will appear here</p>
              </div>
            ) : (
              <div style={{ padding: "28px" }}>

                {/* Task Header */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>
                        Task
                      </p>
                      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.01em" }}>
                        {selectedTask.title}
                      </h2>

                      {/* ✅ FIX #6: Deadline card */}
                      {selectedTask.deadline && (
                        <div
                          style={{
                            marginTop: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 14px",
                            borderRadius: "999px",
                            background: "rgba(255,212,0,0.08)",
                            border: "1px solid rgba(255,212,0,0.18)",
                            color: "#FFD400",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Deadline: {new Date(selectedTask.deadline).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {uploadSuccess && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 14px",
                          borderRadius: "20px",
                          background: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.3)",
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#10B981" }}>Submitted</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Instructions */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" }}>Instructions</span>
                    </div>
                    <div style={{ padding: "16px" }}>
                      <p style={{ fontSize: "13.5px", color: "#D1D5DB", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {selectedTask.instructions}
                      </p>

                      {/* ✅ FIX #7: Max score */}
                      {selectedTask.maxScore && (
                        <div
                          style={{
                            marginTop: "16px",
                            padding: "12px",
                            borderRadius: "10px",
                            background: "rgba(59,130,246,0.08)",
                            border: "1px solid rgba(59,130,246,0.2)",
                            color: "#60A5FA",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          Max Score: {selectedTask.maxScore}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expected Output */}
                  {selectedTask.expectedOutput && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" }}>Expected Output</span>
                      </div>
                      <div style={{ padding: "16px" }}>
                        {isHTML ? (
                          <iframe
                            srcDoc={selectedTask.expectedOutput}
                            style={{
                              width: "100%",
                              height: "280px",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "8px",
                              background: "#FFFFFF",
                            }}
                          />
                        ) : (
                          <pre style={{ margin: 0, padding: "14px", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", fontSize: "12.5px", fontFamily: "'JetBrains Mono', monospace", color: "#4ADE80", overflowX: "auto", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {selectedTask.expectedOutput}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ✅ FIX #8: Evaluation Criteria */}
                  {selectedTask.evaluationCriteria && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "12px",
                        padding: "18px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#FFD400",
                          fontSize: "13px",
                          marginBottom: "10px",
                          margin: "0 0 10px",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        Evaluation Criteria
                      </h3>
                      <p
                        style={{
                          color: "#D1D5DB",
                          fontSize: "13px",
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                          margin: 0,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {selectedTask.evaluationCriteria}
                      </p>
                    </div>
                  )}

                  {/* Starter Code */}
                  {selectedTask.starterCode && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                          </svg>
                          <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" }}>Starter Code</span>
                        </div>
                        <button
                          onClick={copyCode}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                            color: copied ? "#10B981" : "#9CA3AF",
                            fontSize: "11px",
                            fontFamily: "'Space Grotesk', sans-serif",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {copied ? (
                            <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Copied</>
                          ) : (
                            <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy</>
                          )}
                        </button>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <pre style={{ margin: 0, padding: "14px", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", fontSize: "12.5px", fontFamily: "'JetBrains Mono', monospace", color: "#E2E8F0", overflowX: "auto", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {selectedTask.starterCode}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" }}>Submit Solution</span>
                    </div>
                    <div style={{ padding: "16px" }}>

                      {/* Drop zone */}
                      <label
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          padding: "32px 20px",
                          border: `2px dashed ${dragging ? "rgba(179,0,23,0.5)" : file ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: "12px",
                          background: dragging ? "rgba(179,0,23,0.05)" : file ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {file ? (
                          <>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                              </svg>
                            </div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#10B981", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{file.name}</p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                              {(file.size / 1024).toFixed(1)} KB · Click to change
                            </p>
                          </>
                        ) : (
                          <>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                            </div>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                              Drop file here or <span style={{ color: "#FFFFFF" }}>browse</span>
                            </p>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
                              HTML, CSS, JS, ZIP accepted
                            </p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          hidden
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setFile(f);
                            setUploadSuccess(false);
                          }}
                        />
                      </label>

                      <button
                        onClick={submitTask}
                        disabled={loading || !file}
                        style={{
                          width: "100%",
                          marginTop: "14px",
                          padding: "13px 20px",
                          borderRadius: "10px",
                          background:
                            loading || !file
                              ? "rgba(255,255,255,0.05)"
                              : "linear-gradient(135deg, #B30017 0%, #8B0012 100%)",
                          border: `1px solid ${loading || !file ? "rgba(255,255,255,0.08)" : "transparent"}`,
                          color: loading || !file ? "#9CA3AF" : "#FFFFFF",
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "'Space Grotesk', sans-serif",
                          cursor: loading || !file ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "9px",
                          transition: "all 0.2s ease",
                          boxShadow: loading || !file ? "none" : "0 0 20px rgba(179,0,23,0.3)",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading && file) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(179,0,23,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          if (!loading && file) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(179,0,23,0.3)";
                        }}
                      >
                        {loading ? (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Submit Task
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}