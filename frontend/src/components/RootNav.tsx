"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "teacher" | "student" | null;

function getRole(pathname: string): Role {
  if (pathname.startsWith("/teacher")) return "teacher";
  if (pathname.startsWith("/student")) return "student";
  return null;
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || last === "teacher" || last === "student") return "Dashboard";
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function RootNav() {
  const pathname = usePathname();
  const router = useRouter();
  const role = getRole(pathname);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  if (!mounted || !role) return null;

  const title = getPageTitle(pathname);
  const sessionHref = role === "teacher" ? "/teacher/sessions" : "/student/sessions";
  const sessionActive = pathname.includes("/sessions");
  const SESSION_CODE = process.env.NEXT_PUBLIC_SESSION_CODE || "";

  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#9CA3AF",
    cursor: "pointer",
    transition: "all 0.18s ease",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.8); }
        }
        .nav-btn:hover { background:rgba(255,255,255,0.08) !important; border-color:rgba(255,255,255,0.14) !important; color:#FFFFFF !important; }
        .sess-btn:hover { background:rgba(179,0,23,0.18) !important; border-color:rgba(179,0,23,0.45) !important; }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          height: "50px",
          background: scrolled ? "rgba(11,11,11,0.96)" : "rgba(11,11,11,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.45)" : "none",
          transition: "all 0.25s ease",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: "10px",
            maxWidth: "1600px",
            margin: "0 auto",
          }}
        >

          {/* Logo mark */}
          <Link
            href={role === "teacher" ? "/teacher" : "/student"}
            style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "linear-gradient(135deg, #B30017, #8B0012)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(179,0,23,0.38)",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#FFD400", fontWeight: 900, fontSize: "10px", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
                CB
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          {/* Back / Forward */}
          <button
            className="nav-btn"
            onClick={() => router.back()}
            title="Go back"
            style={btnBase}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            className="nav-btn"
            onClick={() => router.forward()}
            title="Go forward"
            style={btnBase}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Divider */}
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          {/* Page Title */}
          <p
            style={{
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "0.01em",
              fontFamily: "'Space Grotesk', sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </p>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto", flexShrink: 0 }}>

            {/* Session code pill */}
            {SESSION_CODE && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: "rgba(255,212,0,0.07)",
                  border: "1px solid rgba(255,212,0,0.18)",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#FFD400",
                    boxShadow: "0 0 5px rgba(255,212,0,0.6)",
                    animation: "pulse-dot 2.5s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#FFD400",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  {SESSION_CODE}
                </span>
              </div>
            )}

            {/* Role badge */}
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "20px",
                background: role === "teacher" ? "rgba(179,0,23,0.1)" : "rgba(59,130,246,0.1)",
                border: `1px solid ${role === "teacher" ? "rgba(179,0,23,0.25)" : "rgba(59,130,246,0.22)"}`,
                fontSize: "9.5px",
                fontWeight: 700,
                color: role === "teacher" ? "#B30017" : "#3B82F6",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {role}
            </div>

            {/* Session button */}
            <Link
              href={sessionHref}
              className="sess-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 13px",
                borderRadius: "8px",
                background: sessionActive ? "rgba(179,0,23,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${sessionActive ? "rgba(179,0,23,0.35)" : "rgba(255,255,255,0.08)"}`,
                color: sessionActive ? "#FFFFFF" : "#9CA3AF",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "all 0.18s ease",
                whiteSpace: "nowrap",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Session
            </Link>

          </div>
        </div>
      </header>
    </>
  );
}