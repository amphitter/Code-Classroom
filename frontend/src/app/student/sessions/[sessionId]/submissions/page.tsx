"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Submission {
  _id: string;
  sessionId: string;
  taskId?: {
    _id: string;
    title: string;
  };
  fileName: string;
  score: number | null;
  status: string;
  createdAt: string;
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {[50, 40, 15, 25, 35].map((w, i) => (
        <td key={i} style={{ padding: "16px 20px" }}>
          <div className="shimmer" style={{ height: "12px", width: `${w}%`, borderRadius: "6px" }} />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const cfg =
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
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: "11px",
        fontWeight: 600,
        color: cfg.color,
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
          background: cfg.dot,
          boxShadow: `0 0 5px ${cfg.dot}`,
          flexShrink: 0,
        }}
      />
      {status || "Unknown"}
    </span>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return (
      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", fontFamily: "'Space Grotesk', sans-serif" }}>
        —
      </span>
    );
  }
  const color = score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#FF4D5E";
  const bg = score >= 80 ? "rgba(16,185,129,0.1)" : score >= 50 ? "rgba(245,158,11,0.1)" : "rgba(255,77,94,0.1)";
  const border = score >= 80 ? "rgba(16,185,129,0.25)" : score >= 50 ? "rgba(245,158,11,0.25)" : "rgba(255,77,94,0.25)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "2px",
        padding: "4px 10px",
        borderRadius: "20px",
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>
        {score}
      </span>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>
        pts
      </span>
    </span>
  );
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
};

export default function StudentSubmissionsPage() {
  const params = useParams();
  const SESSION_ID = params.sessionId as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/submission/session/${SESSION_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!SESSION_ID) return;
    loadSubmissions();
  }, [SESSION_ID]);

  const evaluated = submissions.filter(
    (s) => s.status?.toLowerCase() === "evaluated" || s.status?.toLowerCase() === "graded"
  ).length;

  const avgScore = (() => {
    const scored = submissions.filter((s) => s.score !== null && s.score !== undefined);
    if (!scored.length) return null;
    return Math.round(scored.reduce((a, s) => a + (s.score ?? 0), 0) / scored.length);
  })();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
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
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "28px",
            animation: "fadeUp 0.4s ease forwards",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
              Student
            </p>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              My Submissions
            </h1>
          </div>
          <button
            onClick={loadSubmissions}
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
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.16)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Session Summary Card */}
        <div
          style={{
            marginBottom: "16px",
            padding: "18px",
            borderRadius: "14px",
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            animation: "fadeUp 0.4s ease 0.03s forwards",
            opacity: 0,
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Current Session
          </p>
          <h2
            style={{
              color: "#FFFFFF",
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            Session #{SESSION_ID}
          </h2>
        </div>

        {/* Summary stats */}
        {!loading && submissions.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "14px",
              marginBottom: "20px",
              animation: "fadeUp 0.45s ease 0.06s forwards",
              opacity: 0,
            }}
          >
            {[
              {
                label: "Total",
                value: submissions.length,
                accent: "#3B82F6",
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
              },
              {
                label: "Evaluated",
                value: evaluated,
                accent: "#10B981",
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
              },
              {
                label: "Pending",
                value: submissions.length - evaluated,
                accent: "#F59E0B",
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
              },
              {
                label: "Avg Score",
                value: avgScore !== null ? `${avgScore}` : "—",
                accent: "#B30017",
                suffix: avgScore !== null ? "pts" : "",
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  background: "#111111",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  padding: "18px",
                  position: "relative",
                  overflow: "hidden",
                  animationDelay: `${i * 60}ms`,
                  animation: "fadeUp 0.4s ease forwards",
                  opacity: 0,
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${stat.accent}, transparent)` }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <p style={{ fontSize: "10.5px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                    {stat.label}
                  </p>
                  <span style={{ color: stat.accent, opacity: 0.7 }}>{stat.icon}</span>
                </div>
                <p style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {stat.value}
                  {stat.suffix && <span style={{ fontSize: "13px", fontWeight: 400, color: "#9CA3AF", marginLeft: "3px" }}>{stat.suffix}</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
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
              Submission History
            </p>
            {!loading && submissions.length > 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  fontSize: "11px",
                  color: "#3B82F6",
                  fontWeight: 600,
                }}
              >
                {submissions.length} total
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Task", "File", "Score", "Status", "Submitted"].map((h) => (
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
                        background: "rgba(255,255,255,0.02)",
                        whiteSpace: "nowrap",
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
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "64px 24px",
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
                        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>No submissions yet</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
                          Submit a task to see it appear here
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  submissions.map((item, i) => {
                    const { date, time } = formatDate(item.createdAt);
                    return (
                      <tr
                        key={item._id}
                        className="sub-row"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          cursor: "default",
                          animationDelay: `${i * 40}ms`,
                          animation: "fadeUp 0.4s ease forwards",
                          opacity: 0,
                        }}
                      >
                        {/* Task */}
                        <td style={{ padding: "15px 20px" }}>
                          <p
                            style={{
                              fontSize: "13.5px",
                              fontWeight: 600,
                              color: "#FFFFFF",
                              margin: 0,
                              fontFamily: "'Space Grotesk', sans-serif",
                              maxWidth: "180px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.taskId?.title || "—"}
                          </p>
                        </td>

                        {/* File */}
                        <td style={{ padding: "15px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "6px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                color: "rgba(255,255,255,0.3)",
                              }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            </div>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#9CA3AF",
                                fontFamily: "'JetBrains Mono', monospace",
                                maxWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.fileName || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Score */}
                        <td style={{ padding: "15px 20px" }}>
                          <ScorePill score={item.score} />
                        </td>

                        {/* Status */}
                        <td style={{ padding: "15px 20px" }}>
                          <StatusBadge status={item.status} />
                        </td>

                        {/* Date */}
                        <td style={{ padding: "15px 20px" }}>
                          <div>
                            <p style={{ fontSize: "12.5px", color: "#E5E7EB", margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                              {date}
                            </p>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: "2px 0 0", fontFamily: "'Space Grotesk', sans-serif" }}>
                              {time}
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}