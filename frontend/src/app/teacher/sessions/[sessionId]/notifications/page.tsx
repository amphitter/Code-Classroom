"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

function normalizeText(text?: string) {
  return (text || "").replace(/\\n/g, "\n");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function typeStyles(type?: string) {
  switch ((type || "").toLowerCase()) {
    case "task":
      return {
        label: "Task",
        className:
          "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dot: "bg-blue-400",
      };
    case "evaluation":
      return {
        label: "Evaluation",
        className:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-400",
      };
    case "leaderboard":
      return {
        label: "Leaderboard",
        className:
          "bg-violet-500/10 text-violet-400 border-violet-500/20",
        dot: "bg-violet-400",
      };
    case "system":
      return {
        label: "System",
        className:
          "bg-red-500/10 text-red-400 border-red-500/20",
        dot: "bg-red-400",
      };
    case "announcement":
    default:
      return {
        label: "Announcement",
        className:
          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        dot: "bg-yellow-400",
      };
  }
}

function SkeletonRow() {
  return (
    <div className="border-b border-white/5 p-6">
      <div className="flex justify-between gap-5">
        <div className="flex-1">
          <div className="h-4 w-40 rounded bg-white/8 animate-pulse" />
          <div className="mt-4 h-3 w-full rounded bg-white/8 animate-pulse" />
          <div className="mt-2 h-3 w-3/4 rounded bg-white/8 animate-pulse" />
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="h-7 w-28 rounded-full bg-white/8 animate-pulse" />
          <div className="h-9 w-24 rounded-lg bg-white/8 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const SESSION_ID =
    process.env.NEXT_PUBLIC_SESSION_ID || "";

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/notification/${SESSION_ID}`
      );

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notification/read/${id}`);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 400px 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

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
              Classroom
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
              Notifications
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "13px",
                color: "#9CA3AF",
              }}
            >
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All notifications are read"}
            </p>
          </div>

          <button
            onClick={loadNotifications}
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
              (e.currentTarget as HTMLElement).style.color =
                "#FFFFFF";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.16)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                "#9CA3AF";
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
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
            animation: "fadeUp 0.45s ease 0.1s forwards",
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
              Notification Center
            </p>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {notifications.length} total
            </span>
          </div>

          {loading ? (
            <div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : notifications.length === 0 ? (
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
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                🔔
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#9CA3AF",
                  margin: 0,
                }}
              >
                No Notifications Yet
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.2)",
                  margin: 0,
                }}
              >
                New updates will appear here in real time
              </p>
            </div>
          ) : (
            notifications.map((item, index) => {
              const styled = typeStyles(item.type);

              return (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "18px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: item.isRead
                      ? "transparent"
                      : "rgba(255,255,255,0.015)",
                    animation: `fadeUp 0.4s ease forwards`,
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                    transition: "background 0.2s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = item.isRead
                      ? "transparent"
                      : "rgba(255,255,255,0.015)";
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: item.isRead ? "rgba(255,255,255,0.15)" : "#B30017",
                      boxShadow: item.isRead
                        ? "none"
                        : "0 0 8px rgba(179,0,23,0.6)",
                      marginTop: "7px",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-3">
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {normalizeText(item.title)}
                      </h3>

                      {!item.isRead && (
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            background: "rgba(179,0,23,0.14)",
                            color: "#B30017",
                            border: "1px solid rgba(179,0,23,0.25)",
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#9CA3AF",
                        margin: "6px 0 0",
                        lineHeight: 1.75,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {normalizeText(item.message)}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.28)",
                        }}
                      >
                        {timeAgo(item.createdAt)}
                      </span>

                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.18)",
                        }}
                      >
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "10px",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.09)",
                        fontSize: "11px",
                        color: "#9CA3AF",
                        background: "rgba(255,255,255,0.03)",
                        textTransform: "capitalize",
                      }}
                    >
                      {styled.label}
                    </span>

                    {!item.isRead && (
                      <button
                        onClick={() => markRead(item._id)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(179,0,23,0.28)",
                          background: "rgba(179,0,23,0.08)",
                          color: "#B30017",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            "rgba(179,0,23,0.16)";
                          (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            "rgba(179,0,23,0.08)";
                          (e.currentTarget as HTMLElement).style.color = "#B30017";
                        }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}