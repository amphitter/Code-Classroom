"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Task {
  _id: string;
  title: string;
  instructions: string;
  createdAt?: string;
}

interface SessionInfo {
  _id: string;
  title: string;
  code: string;
  isActive?: boolean;
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          className="shimmer"
          style={{
            height: "13px",
            width: "40%",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        />
        <div
          className="shimmer"
          style={{
            height: "11px",
            width: "70%",
            borderRadius: "6px",
          }}
        />
      </div>
    </div>
  );
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

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
        background:
          type === "success"
            ? "rgba(16,185,129,0.12)"
            : "rgba(179,0,23,0.12)",
        border: `1px solid ${
          type === "success"
            ? "rgba(16,185,129,0.3)"
            : "rgba(179,0,23,0.35)"
        }`,
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "slideInToast 0.3s ease forwards",
        fontFamily: "'Space Grotesk', sans-serif",
        maxWidth: "360px",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: type === "success" ? "#10B981" : "#B30017",
          boxShadow: `0 0 8px ${
            type === "success" ? "#10B981" : "#B30017"
          }`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "13.5px",
          fontWeight: 500,
          color: "#FFFFFF",
          flex: 1,
        }}
      >
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#9CA3AF",
          cursor: "pointer",
          padding: 0,
          fontSize: "16px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function TasksPage() {
  const params = useParams();
  const sessionId = Array.isArray(params?.sessionId)
    ? params.sessionId[0]
    : (params?.sessionId as string) || "";

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [formFocused, setFormFocused] = useState<string | null>(null);

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      const response = await api.get(`/session/${sessionId}`);
      setSession(response.data.session || null);
    } catch (error) {
      console.error(error);
      setSession(null);
    }
  };

  const loadTasks = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await api.get(`/task/session/${sessionId}`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error(error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    void loadSession();
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const createTask = async () => {
    if (!title.trim() || !instructions.trim()) {
      setToast({
        message: "Title and instructions are required.",
        type: "error",
      });
      return;
    }

    const sessionCode = session?.code?.trim();

    if (!sessionCode) {
      setToast({
        message: "Session code not loaded yet.",
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/task/create", {
        sessionCode,
        title,
        instructions,
      });

      setTitle("");
      setInstructions("");
      await loadTasks();

      setToast({
        message: "Task created successfully.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({
        message: "Failed to create task. Try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field: string): CSSProperties => ({
    width: "100%",
    background:
      formFocused === field
        ? "rgba(255,255,255,0.05)"
        : "rgba(255,255,255,0.03)",
    border: `1px solid ${
      formFocused === field
        ? "rgba(179,0,23,0.5)"
        : "rgba(255,255,255,0.08)"
    }`,
    borderRadius: "10px",
    padding: "13px 16px",
    color: "#FFFFFF",
    fontSize: "13.5px",
    fontFamily: "'Space Grotesk', sans-serif",
    outline: "none",
    resize: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    boxShadow:
      formFocused === field ? "0 0 0 3px rgba(179,0,23,0.1)" : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.5s infinite;
        }
        .task-row:hover { background: rgba(255,255,255,0.02) !important; }
        ::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "36px",
            animation: "fadeUp 0.4s ease forwards",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                color: "#9CA3AF",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 6px",
                fontWeight: 500,
              }}
            >
              Session · {session?.code || sessionId}
            </p>
            <h1
              style={{
                fontSize: "clamp(24px, 3vw, 32px)",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Tasks
            </h1>
          </div>

          <button
            onClick={loadTasks}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9CA3AF",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.16)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.04)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "28px",
              position: "relative",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease 0.1s forwards",
              opacity: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #B30017, transparent)",
              }}
            />
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#9CA3AF",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: "0 0 20px",
              }}
            >
              Create Task
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#9CA3AF",
                    fontWeight: 500,
                    marginBottom: "8px",
                    letterSpacing: "0.04em",
                  }}
                >
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build a REST API"
                  style={inputStyle("title")}
                  onFocus={() => setFormFocused("title")}
                  onBlur={() => setFormFocused(null)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#9CA3AF",
                    fontWeight: 500,
                    marginBottom: "8px",
                    letterSpacing: "0.04em",
                  }}
                >
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe what students need to do..."
                  rows={6}
                  style={inputStyle("instructions")}
                  onFocus={() => setFormFocused("instructions")}
                  onBlur={() => setFormFocused(null)}
                />
              </div>

              <button
                onClick={createTask}
                disabled={submitting}
                style={{
                  padding: "13px 20px",
                  borderRadius: "10px",
                  background: submitting
                    ? "rgba(179,0,23,0.4)"
                    : "linear-gradient(135deg, #B30017 0%, #8B0012 100%)",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: submitting ? "none" : "0 0 20px rgba(179,0,23,0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 30px rgba(179,0,23,0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 20px rgba(179,0,23,0.3)";
                  }
                }}
              >
                {submitting ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease 0.18s forwards",
              opacity: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#9CA3AF",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Recent Tasks
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

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : tasks.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 24px",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  ⊞
                </div>
                <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
                  No tasks yet
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.2)",
                    margin: 0,
                  }}
                >
                  Create your first task to get started
                </p>
              </div>
            ) : (
              tasks.map((task, i) => (
                <div
                  key={task._id}
                  className="task-row"
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "18px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "default",
                    transition: "background 0.15s ease",
                    animationDelay: `${i * 50}ms`,
                    animation: "fadeUp 0.4s ease forwards",
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "rgba(179,0,23,0.12)",
                      border: "1px solid rgba(179,0,23,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#B30017",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        fontFamily: "'Space Grotesk', sans-serif",
                        margin: "0 0 4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#9CA3AF",
                        fontFamily: "'Space Grotesk', sans-serif",
                        margin: 0,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {task.instructions}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}