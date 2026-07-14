"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

interface Student {
  name: string;
  rollNo: string;
}

interface Submission {
  submissionId: string;
  student?: Student;
  fileName: string;
  score: number | null;
  status: string;
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} style={{ padding: "16px 20px" }}>
          <div
            className="shimmer"
            style={{
              height: "12px",
              width: i === 2 ? "80%" : i === 5 ? "60px" : "65%",
              borderRadius: "6px",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const config =
    s === "evaluated" || s === "graded"
      ? { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", color: "#10B981", dot: "#10B981" }
      : s === "pending"
      ? { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#F59E0B", dot: "#F59E0B" }
      : s === "failed"
      ? { bg: "rgba(179,0,23,0.1)", border: "rgba(179,0,23,0.3)", color: "#FF4D5E", dot: "#B30017" }
      : { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", color: "#9CA3AF", dot: "#9CA3AF" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "20px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        fontSize: "11px",
        fontWeight: 600,
        color: config.color,
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "0.04em",
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: config.dot,
          boxShadow: `0 0 5px ${config.dot}`,
          flexShrink: 0,
        }}
      />
      {status || "Unknown"}
    </span>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", fontFamily: "'Space Grotesk', sans-serif" }}>—</span>;
  }
  const color = score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#FF4D5E";
  return (
    <span
      style={{
        fontSize: "13.5px",
        fontWeight: 700,
        color,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {score}
      <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.3)", marginLeft: "2px" }}>pts</span>
    </span>
  );
}

export default function TeacherSubmissionsPage() {
  const [taskId, setTaskId] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = async () => {
    if (!taskId.trim()) {
      setError("Please enter a Task ID.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      setSearched(true);
      const response = await api.get(`/task/${taskId.trim()}/submissions`);
      setSubmissions(response.data.submissions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load submissions. Check the Task ID and try again.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") loadSubmissions();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.5s infinite;
        }
        .sub-row:hover td { background: rgba(255,255,255,0.02) !important; }
        .review-btn:hover {
          background: rgba(179,0,23,0.15) !important;
          border-color: rgba(179,0,23,0.4) !important;
          color: #FFFFFF !important;
        }
        ::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px", animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
            Teacher
          </p>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Submission Review
          </h1>
        </div>

        {/* Search Bar */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            animation: "fadeUp 0.45s ease 0.08s forwards",
            opacity: 0,
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>
            Look Up Task
          </p>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 300px", minWidth: "200px" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: inputFocused ? "#B30017" : "rgba(255,255,255,0.2)",
                  transition: "color 0.2s ease",
                  pointerEvents: "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                value={taskId}
                onChange={(e) => {
                  setTaskId(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Enter Task ID..."
                style={{
                  width: "100%",
                  background: inputFocused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${error ? "rgba(179,0,23,0.5)" : inputFocused ? "rgba(179,0,23,0.45)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "10px",
                  padding: "12px 16px 12px 40px",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                  boxShadow: inputFocused ? "0 0 0 3px rgba(179,0,23,0.1)" : "none",
                }}
              />
            </div>
            <button
              onClick={loadSubmissions}
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                background: loading ? "rgba(179,0,23,0.4)" : "linear-gradient(135deg, #B30017 0%, #8B0012 100%)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "13.5px",
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                boxShadow: loading ? "none" : "0 0 20px rgba(179,0,23,0.3)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(179,0,23,0.5)"; }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(179,0,23,0.3)"; }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Load Submissions
                </>
              )}
            </button>
          </div>
          {error && (
            <p style={{ fontSize: "12px", color: "#FF4D5E", margin: "10px 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Table */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
            animation: "fadeUp 0.45s ease 0.15s forwards",
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
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Submissions
            </p>
            {searched && !loading && (
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
                {submissions.length} found
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Student", "Roll No", "File", "Score", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        textAlign: "left",
                        fontSize: "10.5px",
                        fontWeight: 600,
                        color: "#9CA3AF",
                        fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : !searched ? (
                  <tr>
                    <td colSpan={6}>
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
                            color: "rgba(255,255,255,0.2)",
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        </div>
                        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                          Enter a Task ID to view submissions
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
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
                            color: "rgba(255,255,255,0.2)",
                            fontSize: "20px",
                          }}
                        >
                          ◈
                        </div>
                        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>No submissions found</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: 0 }}>No students have submitted for this task yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  submissions.map((item, i) => (
                    <tr
                      key={item.submissionId}
                      className="sub-row"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        animationDelay: `${i * 50}ms`,
                        animation: "fadeUp 0.4s ease forwards",
                        opacity: 0,
                        cursor: "default",
                      }}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, rgba(179,0,23,0.4), rgba(139,0,18,0.3))",
                              border: "1px solid rgba(179,0,23,0.25)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#FFFFFF",
                              flexShrink: 0,
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            {item.student?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#FFFFFF", fontFamily: "'Space Grotesk', sans-serif", whiteSpace: "nowrap" }}>
                            {item.student?.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            fontFamily: "'JetBrains Mono', monospace",
                            background: "rgba(255,255,255,0.04)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          {item.student?.rollNo || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            fontFamily: "'JetBrains Mono', monospace",
                            maxWidth: "180px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        >
                          {item.fileName || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <ScorePill score={item.score} />
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <a
                          href={`/teacher/submissions/${item.submissionId}`}
                          className="review-btn"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 14px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#9CA3AF",
                            textDecoration: "none",
                            fontSize: "12px",
                            fontWeight: 500,
                            fontFamily: "'Space Grotesk', sans-serif",
                            transition: "all 0.2s ease",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Review
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}