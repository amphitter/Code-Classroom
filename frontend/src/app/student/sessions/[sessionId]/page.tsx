"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Student {
  name: string;
  rollNo: string;
  email?: string;
}

const QUICK_LINKS = [
  {
    href: "/student/tasks",
    label: "Tasks",
    description: "View & submit assignments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    accent: "#3B82F6",
    accentBg: "rgba(59,130,246,0.1)",
    accentBorder: "rgba(59,130,246,0.2)",
  },
  {
    href: "/student/submissions",
    label: "Submissions",
    description: "Track your work",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    accent: "#8B5CF6",
    accentBg: "rgba(139,92,246,0.1)",
    accentBorder: "rgba(139,92,246,0.2)",
  },
  {
    href: "/student/leaderboard",
    label: "Leaderboard",
    description: "See your ranking",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    accent: "#FFD400",
    accentBg: "rgba(255,212,0,0.1)",
    accentBorder: "rgba(255,212,0,0.2)",
  },
  {
    href: "/student/presentation",
    label: "Live Presentation",
    description: "Join your teacher's screen",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    accent: "#10B981",
    accentBg: "rgba(16,185,129,0.1)",
    accentBorder: "rgba(16,185,129,0.2)",
  },
  {
    href: "/student/notifications",
    label: "Notifications",
    description: "Alerts & updates",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    accent: "#F59E0B",
    accentBg: "rgba(245,158,11,0.1)",
    accentBorder: "rgba(245,158,11,0.2)",
  },
];

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
  index,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "22px",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 70}ms`,
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
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          {label}
        </p>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      <p style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "4px 0 0" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function StudentPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [mounted, setMounted] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setStudent(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    const hour = new Date().getHours();
    setTimeOfDay(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const initials = student?.name
    ? student.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "S";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .quick-card:hover {
          background: rgba(255,255,255,0.05) !important;
          transform: translateY(-2px);
        }
        .quick-card { transition: all 0.2s ease !important; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Hero greeting */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            position: "relative",
            overflow: "hidden",
            animation: "fadeUp 0.4s ease forwards",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #3B82F6, #8B5CF6, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(59,130,246,0.3)",
                  animation: "pulse-ring 2.5s ease-out infinite",
                }}
              />
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "0 0 24px rgba(59,130,246,0.3)",
                }}
              >
                {initials}
              </div>
              {/* Online dot */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#10B981",
                  border: "2px solid #0B0B0B",
                  boxShadow: "0 0 8px rgba(16,185,129,0.6)",
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.08em", margin: "0 0 4px", fontWeight: 500 }}>
                {mounted ? timeOfDay : "Welcome back"} 👋
              </p>
              <h1
                style={{
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  margin: 0,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {student?.name || "Student"}
              </h1>
              {student?.email && (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>
                  {student.email}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#10B981", letterSpacing: "0.04em" }}>
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            label="Name"
            value={student?.name || "—"}
            accent="#3B82F6"
            index={0}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <StatCard
            label="Roll No"
            value={student?.rollNo || "—"}
            accent="#8B5CF6"
            index={1}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
          <StatCard
            label="Session"
            value="Active"
            sub="Live session in progress"
            accent="#FFD400"
            index={2}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <StatCard
            label="Status"
            value="Online"
            sub="Connected to server"
            accent="#10B981"
            index={3}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
        </div>

        {/* Quick Links */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
            animation: "fadeUp 0.45s ease 0.28s forwards",
            opacity: 0,
          }}
        >
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Quick Access
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1px",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            {QUICK_LINKS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="quick-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "20px",
                  background: "#111111",
                  textDecoration: "none",
                  animationDelay: `${0.3 + i * 0.05}s`,
                  animation: "fadeUp 0.4s ease forwards",
                  opacity: 0,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: item.accentBg,
                    border: `1px solid ${item.accentBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.accent,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#FFFFFF", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: "11.5px", color: "#9CA3AF", margin: "3px 0 0", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.description}
                  </p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={item.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.5, marginTop: "auto" }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}