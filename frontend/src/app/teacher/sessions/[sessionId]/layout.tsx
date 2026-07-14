"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/storage";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const DASHBOARD_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const STUDENTS_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TASKS_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const SUBMISSIONS_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const LEADERBOARD_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const AI_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </svg>
);

const PRESENTATION_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const NOTIFICATIONS_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

function buildNavItems(sessionId: string): NavItem[] {
  const sessionBase = sessionId ? `/teacher/sessions/${sessionId}` : "/teacher";

  return [
    {
      href: sessionId ? sessionBase : "/teacher",
      label: "Dashboard",
      icon: DASHBOARD_ICON,
    },
    {
      href: sessionId ? `${sessionBase}/students` : "/teacher/students",
      label: "Students",
      icon: STUDENTS_ICON,
    },
    {
      href: sessionId ? `${sessionBase}/tasks` : "/teacher/tasks",
      label: "Tasks",
      icon: TASKS_ICON,
    },
    {
      href: sessionId
        ? `${sessionBase}/submissions`
        : "/teacher/submissions",
      label: "Submissions",
      icon: SUBMISSIONS_ICON,
    },
    {
      href: sessionId
        ? `${sessionBase}/leaderboard`
        : "/teacher/leaderboard",
      label: "Leaderboard",
      icon: LEADERBOARD_ICON,
    },
   {
      href: sessionId
        ? `${sessionBase}/ai`
        : "/teacher/ai",
      label: "AI Assistant",
      icon: AI_ICON,
    },
    {
      href: sessionId
        ? `${sessionBase}/presentation`
        : "/teacher/presentation",
      label: "Presentation",
      icon: PRESENTATION_ICON,
    },
    {
      href: sessionId
        ? `${sessionBase}/notifications`
        : "/teacher/notifications",
      label: "Notifications",
      icon: NOTIFICATIONS_ICON,
    },
  ];
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sessionMatch = pathname.match(/^\/teacher\/sessions\/([^/]+)/);
  const sessionId = sessionMatch?.[1] || "";

  const navItems = buildNavItems(sessionId);

  const isActive = (href: string) => {
    if (href === "/teacher") return pathname === "/teacher";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const SidebarContent = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0E0E0E",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "-40px",
          width: "220px",
          height: "220px",
          background:
            "radial-gradient(circle, rgba(179,0,23,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />

      <div
        style={{
          padding: collapsed ? "28px 16px" : "28px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          transition: "padding 0.3s ease",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #B30017 0%, #8B0012 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 20px rgba(179,0,23,0.4)",
          }}
        >
          <span
            style={{
              color: "#FFD400",
              fontWeight: 900,
              fontSize: "14px",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            CB
          </span>
        </div>

        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                color: "#FFFFFF",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              Code Build
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                color: "#FFD400",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              Launch
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Partners:
          </span>
          <span
            style={{
              fontSize: "9px",
              color: "rgba(255,212,0,0.6)",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.06em",
            }}
          >
            BTC · CITN
          </span>
        </div>
      )}

      <nav
        style={{
          flex: 1,
          padding: collapsed ? "16px 10px" : "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
          transition: "padding 0.3s ease",
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: collapsed ? "10px 12px" : "10px 14px",
                borderRadius: "10px",
                background: active
                  ? "linear-gradient(135deg, rgba(179,0,23,0.25) 0%, rgba(139,0,18,0.15) 100%)"
                  : "transparent",
                border: active
                  ? "1px solid rgba(179,0,23,0.35)"
                  : "1px solid transparent",
                color: active ? "#FFFFFF" : "#9CA3AF",
                textDecoration: "none",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "transparent";
                }
              }}
            >
              {active && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "60%",
                    background: "#B30017",
                    borderRadius: "0 3px 3px 0",
                    boxShadow: "0 0 8px rgba(179,0,23,0.8)",
                  }}
                />
              )}

              <span
                style={{
                  color: active ? "#FFD400" : "inherit",
                  flexShrink: 0,
                  display: "flex",
                }}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: active ? 600 : 400,
                    fontSize: "13.5px",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: "0 12px",
          padding: "10px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#9CA3AF",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          marginBottom: "8px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.03)";
          (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div
        style={{
          padding: collapsed ? "16px 10px" : "16px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #B30017, #FFD400)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "12px",
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              T
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Instructor
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#9CA3AF",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Teacher · Active
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "transparent",
            border: "1px solid rgba(179,0,23,0.2)",
            color: "#9CA3AF",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "13.5px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(179,0,23,0.12)";
            (e.currentTarget as HTMLElement).style.color = "#FF4D5E";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(179,0,23,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(179,0,23,0.2)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0B0B0B; color: #FFFFFF; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-enter { animation: fadeSlideIn 0.35s ease forwards; }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#0B0B0B",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <aside
          style={{
            width: collapsed ? "72px" : "256px",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
            transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            display: "none",
            zIndex: 50,
          }}
          className="lg-sidebar"
        >
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 98,
            }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          style={{
            position: "fixed",
            left: mobileOpen ? 0 : "-280px",
            top: 0,
            width: "260px",
            height: "100vh",
            zIndex: 99,
            transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
          className="mobile-sidebar"
        >
          <SidebarContent />
        </aside>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <header
            style={{
              height: "60px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(11,11,11,0.8)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 28px",
              position: "sticky",
              top: 0,
              zIndex: 40,
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#9CA3AF",
                cursor: "pointer",
              }}
              className="mobile-menu-btn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#9CA3AF",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Teacher</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span style={{ color: "#FFFFFF", fontWeight: 500 }}>
                {navItems.find((n) => isActive(n.href))?.label || "Dashboard"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background: "rgba(179,0,23,0.1)",
                  border: "1px solid rgba(179,0,23,0.2)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 6px #22c55e",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  LIVE SESSION
                </span>
              </div>

              <Link
                href="/teacher/notifications"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#9CA3AF",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.04)";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </Link>
            </div>
          </header>

          <main
            className="page-enter"
            style={{
              flex: 1,
              padding: "32px 28px",
              overflowY: "auto",
              background: "#0B0B0B",
            }}
          >
            {children}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (min-width: 1024px) {
          .lg-sidebar { display: block !important; }
          .mobile-sidebar { display: none !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-sidebar { display: none !important; }
          .mobile-sidebar { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}