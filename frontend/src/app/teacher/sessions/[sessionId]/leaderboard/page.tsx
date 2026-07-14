"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";  

interface LeaderboardEntry {
  studentId: string;
  name: string;
  rollNo: string;
  totalScore: number;
}

const RANK_CONFIG: Record<number, { bg: string; border: string; color: string; glow: string; icon: string }> = {
  0: {
    bg: "rgba(255,212,0,0.08)",
    border: "rgba(255,212,0,0.25)",
    color: "#FFD400",
    glow: "rgba(255,212,0,0.4)",
    icon: "🥇",
  },
  1: {
    bg: "rgba(192,192,192,0.07)",
    border: "rgba(192,192,192,0.2)",
    color: "#C0C0C0",
    glow: "rgba(192,192,192,0.3)",
    icon: "🥈",
  },
  2: {
    bg: "rgba(205,127,50,0.07)",
    border: "rgba(205,127,50,0.2)",
    color: "#CD7F32",
    glow: "rgba(205,127,50,0.3)",
    icon: "🥉",
  },
};

function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const cfg = RANK_CONFIG[rank];
  const heights = [140, 110, 90];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        animation: `fadeUp 0.5s ease ${rank * 0.1}s forwards`,
        opacity: 0,
      }}
    >
      <div
        style={{
          fontSize: "28px",
          lineHeight: 1,
          filter: `drop-shadow(0 0 10px ${cfg.glow})`,
        }}
      >
        {cfg.icon}
      </div>
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: cfg.bg,
          border: `2px solid ${cfg.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 800,
          color: cfg.color,
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: `0 0 20px ${cfg.glow}`,
        }}
      >
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", margin: 0, fontFamily: "'Space Grotesk', sans-serif", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.name}
        </p>
        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0", fontFamily: "'Space Grotesk', sans-serif" }}>
          {entry.rollNo}
        </p>
      </div>
      <div
        style={{
          width: "80px",
          height: `${heights[rank]}px`,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: "10px 10px 0 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "12px",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 800, color: cfg.color, fontFamily: "'Space Grotesk', sans-serif" }}>
          {entry.totalScore}
        </span>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {[8, 35, 28, 20].map((w, i) => (
        <td key={i} style={{ padding: "16px 20px" }}>
          <div className="shimmer" style={{ height: "12px", width: `${w + 20}%`, borderRadius: "6px" }} />
        </td>
      ))}
    </tr>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
const params = useParams();
  const SESSION_ID =
  params.sessionId as string;
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leaderboard/${SESSION_ID}`);
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
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
        .lb-row:hover td { background: rgba(255,255,255,0.02) !important; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "36px",
            animation: "fadeUp 0.4s ease forwards",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
              Session Rankings
            </p>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Leaderboard
            </h1>
          </div>
          <button
            onClick={loadLeaderboard}
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

        {/* Podium — top 3 */}
        {!loading && top3.length >= 2 && (
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "36px 24px 0",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-60px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "300px",
                height: "200px",
                background: "radial-gradient(circle, rgba(255,212,0,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            {/* Reorder: 2nd, 1st, 3rd */}
            {[
              top3[1] && { entry: top3[1], rank: 1 },
              top3[0] && { entry: top3[0], rank: 0 },
              top3[2] && { entry: top3[2], rank: 2 },
            ]
              .filter(Boolean)
              .map(
                (item) =>
                  item && (
                    <PodiumCard
                      key={item.entry.studentId}
                      entry={item.entry}
                      rank={item.rank}
                    />
                  )
              )}
          </div>
        )}

        {/* Full Table */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
            animation: "fadeUp 0.45s ease 0.2s forwards",
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
              All Participants
            </p>
            {!loading && (
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
                {leaderboard.length} students
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Rank", "Student", "Roll No", "Score"].map((h) => (
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
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
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
                            fontSize: "22px",
                          }}
                        >
                          ◈
                        </div>
                        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>No rankings yet</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
                          Scores will appear once students complete tasks
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((student, index) => {
                    const isTop3 = index < 3;
                    const cfg = RANK_CONFIG[index];
                    return (
                      <tr
                        key={student.studentId}
                        className="lb-row"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          cursor: "default",
                          animationDelay: `${index * 40}ms`,
                          animation: "fadeUp 0.4s ease forwards",
                          opacity: 0,
                          background: isTop3 ? cfg.bg : "transparent",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* Rank */}
                        <td style={{ padding: "15px 20px", width: "72px" }}>
                          {isTop3 ? (
                            <span style={{ fontSize: "18px", lineHeight: 1 }}>{cfg.icon}</span>
                          ) : (
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "rgba(255,255,255,0.25)",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              #{index + 1}
                            </span>
                          )}
                        </td>

                        {/* Student */}
                        <td style={{ padding: "15px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                background: isTop3 ? cfg.bg : "rgba(255,255,255,0.05)",
                                border: `1px solid ${isTop3 ? cfg.border : "rgba(255,255,255,0.1)"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: isTop3 ? cfg.color : "#9CA3AF",
                                fontFamily: "'Space Grotesk', sans-serif",
                                flexShrink: 0,
                                boxShadow: isTop3 ? `0 0 10px ${cfg.glow}` : "none",
                              }}
                            >
                              {student.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span
                              style={{
                                fontSize: "13.5px",
                                fontWeight: isTop3 ? 700 : 500,
                                color: isTop3 ? "#FFFFFF" : "#E5E7EB",
                                fontFamily: "'Space Grotesk', sans-serif",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {student.name}
                            </span>
                          </div>
                        </td>

                        {/* Roll No */}
                        <td style={{ padding: "15px 20px" }}>
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
                            {student.rollNo}
                          </span>
                        </td>

                        {/* Score */}
                        <td style={{ padding: "15px 20px" }}>
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: 800,
                              color: isTop3 ? cfg.color : "#FFFFFF",
                              fontFamily: "'Space Grotesk', sans-serif",
                              textShadow: isTop3 ? `0 0 12px ${cfg.glow}` : "none",
                            }}
                          >
                            {student.totalScore}
                            <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.25)", marginLeft: "3px" }}>pts</span>
                          </span>
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