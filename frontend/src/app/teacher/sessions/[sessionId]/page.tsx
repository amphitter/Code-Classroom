"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";

interface TopPerformer {
  name: string;
  rollNo: string;
  score: number;
}

interface Analytics {
  totalStudents: number;
  attendanceCount: number;
  totalTasks: number;
  averageScore: number;
  topPerformer?: TopPerformer;
}

interface Activity {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

const sessionId = "12345"; // Placeholder, replace with dynamic session ID as needed
const QUICK_ACTIONS = [
  { href: `/teacher/sessions/${sessionId}/presentation`, label: "Presentation", icon: "▶", color: "#B30017" },
  { href: `/teacher/sessions/${sessionId}/ai`, label: "AI Assistant", icon: "✦", color: "#FFD400" },
  { href: `/teacher/sessions/${sessionId}/tasks`, label: "Tasks", icon: "⊞", color: "#3B82F6" },
  { href: `/teacher/sessions/${sessionId}/students`, label: "Students", icon: "⊙", color: "#10B981" },
  { href: `/teacher/sessions/${sessionId}/leaderboard`, label: "Leaderboard", icon: "◈", color: "#8B5CF6" },
  { href: `/teacher/sessions/${sessionId}/notifications`, label: "Notifications", icon: "◉", color: "#F59E0B" },
];

function StatCard({
  label,
  value,
  suffix = "",
  index,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  index: number;
}) {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 80}ms`,
        animation: "fadeUp 0.45s ease forwards",
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
          background:
            index === 0
              ? "linear-gradient(90deg, #B30017, transparent)"
              : index === 1
              ? "linear-gradient(90deg, #FFD400, transparent)"
              : index === 2
              ? "linear-gradient(90deg, #3B82F6, transparent)"
              : "linear-gradient(90deg, #10B981, transparent)",
        }}
      />
      <p
        style={{
          fontSize: "11px",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          color: "#9CA3AF",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "36px",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          color: "#FFFFFF",
          margin: "10px 0 0",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
        {suffix && (
          <span style={{ fontSize: "20px", color: "#9CA3AF", fontWeight: 400 }}>{suffix}</span>
        )}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "24px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="shimmer" style={{ height: "11px", width: "60px", borderRadius: "6px", background: "rgba(255,255,255,0.06)" }} />
      <div className="shimmer" style={{ height: "36px", width: "80px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", marginTop: "14px" }} />
    </div>
  );
}

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        animationDelay: `${index * 60}ms`,
        animation: "fadeUp 0.4s ease forwards",
        opacity: 0,
        transition: "background 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#B30017",
          boxShadow: "0 0 8px rgba(179,0,23,0.6)",
          marginTop: "6px",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "13.5px",
            fontWeight: 600,
            color: "#FFFFFF",
            fontFamily: "'Space Grotesk', sans-serif",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {activity.title}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#9CA3AF",
            fontFamily: "'Space Grotesk', sans-serif",
            margin: "3px 0 0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {activity.description}
        </p>
      </div>
      <span
        style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.25)",
          fontFamily: "'Space Grotesk', sans-serif",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        {timeAgo(activity.createdAt)}
      </span>
    </div>
  );
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
const params = useParams();

const SESSION_ID =
params.sessionId as string;
  const loadDashboard = async () => {
    if (!SESSION_ID) {
      console.error("NEXT_PUBLIC_SESSION_ID missing");
      return;
    }
    try {
      setLoading(true);
      const [analyticsRes, activityRes] = await Promise.all([
        api.get(`/analytics/${SESSION_ID}`),
        api.get(`/activity/${SESSION_ID}`),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setActivities(activityRes.data.activities || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    socket.connect();
    const events = ["activity_created", "task_created", "evaluation_completed", "student_joined_live", "notification_received"];
    events.forEach((e) => socket.on(e, loadDashboard));
    return () => {
      events.forEach((e) => socket.off(e, loadDashboard));
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
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
        .action-card:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.14) !important; transform: translateY(-2px); }
        .action-card { transition: all 0.2s ease !important; }
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
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
              Overview
            </p>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Teacher Dashboard
            </h1>
          </div>
          <button
            onClick={loadDashboard}
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

        {/* Analytics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Students" value={analytics?.totalStudents ?? 0} index={0} />
              <StatCard label="Attendance" value={analytics?.attendanceCount ?? 0} index={1} />
              <StatCard label="Tasks" value={analytics?.totalTasks ?? 0} index={2} />
              <StatCard label="Avg Score" value={analytics?.averageScore ?? 0} suffix="%" index={3} />
            </>
          )}
        </div>

        {/* Top Performer + Quick Actions row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "28px" }}>

          {/* Top Performer */}
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease 0.2s forwards",
              opacity: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                right: "-30px",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,212,0,0.08) 0%, transparent 70%)",
              }}
            />
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>
              Top Performer
            </p>
            {loading ? (
              <>
                <div className="shimmer" style={{ height: "14px", width: "120px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", marginBottom: "10px" }} />
                <div className="shimmer" style={{ height: "11px", width: "80px", borderRadius: "6px", background: "rgba(255,255,255,0.06)" }} />
              </>
            ) : analytics?.topPerformer ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #FFD400, #F59E0B)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0B0B0B",
                      flexShrink: 0,
                    }}
                  >
                    {analytics.topPerformer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                      {analytics.topPerformer.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>
                      {analytics.topPerformer.rollNo}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    background: "rgba(255,212,0,0.1)",
                    border: "1px solid rgba(255,212,0,0.2)",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#FFD400", fontWeight: 600 }}>
                    {analytics.topPerformer.score} pts
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: "8px" }}>
                <span style={{ fontSize: "28px", opacity: 0.3 }}>◈</span>
                <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>No data yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "24px",
              animation: "fadeUp 0.45s ease 0.25s forwards",
              opacity: 0,
            }}
          >
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>
              Quick Actions
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="action-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 10px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      color: action.color,
                      lineHeight: 1,
                    }}
                  >
                    {action.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 500,
                      color: "#9CA3AF",
                      fontFamily: "'Space Grotesk', sans-serif",
                      textAlign: "center",
                    }}
                  >
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
            animation: "fadeUp 0.45s ease 0.3s forwards",
            opacity: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 20px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Activity Feed
            </p>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {activities.length} events
            </span>
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="shimmer" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", marginTop: "6px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="shimmer" style={{ height: "13px", width: "55%", borderRadius: "6px", background: "rgba(255,255,255,0.06)", marginBottom: "8px" }} />
                  <div className="shimmer" style={{ height: "11px", width: "80%", borderRadius: "6px", background: "rgba(255,255,255,0.06)" }} />
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "56px 24px",
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
                ◉
              </div>
              <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                No activity yet
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                Events will appear here in real time
              </p>
            </div>
          ) : (
            activities.map((activity, i) => (
              <ActivityItem key={activity._id} activity={activity} index={i} />
            ))
          )}
        </div>
      </div>
    </>
  );
}