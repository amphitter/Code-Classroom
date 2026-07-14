"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface AIContent {
  title: string;
  explanation: string;
  instructions: string;
  starterCode: string;
  expectedOutput: string;
  evaluationCriteria?: string;
  notificationTitle?: string;
  notificationMessage?: string;
}

type Level = "Beginner" | "Intermediate" | "Advanced";

const LEVELS: Level[] = ["Beginner", "Intermediate", "Advanced"];

const LEVEL_CONFIG: Record<Level, { color: string; bg: string; border: string }> = {
  Beginner: { color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
  Intermediate: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  Advanced: { color: "#B30017", bg: "rgba(179,0,23,0.1)", border: "rgba(179,0,23,0.3)" },
};

const DURATIONS = ["1 Minutes", "5 Minutes", "10 Minutes", "15 Minutes", "20 Minutes"];

const SECTION_ICONS: Record<string, React.ReactNode> = {  Explanation: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Instructions: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  "Starter Code": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "Expected Output": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  "Evaluation Criteria": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
};

function normalizeText(text?: string) {
  return (text || "").replace(/\\n/g, "\n");
}

function isHtmlLike(output?: string) {
  const text = normalizeText(output).toLowerCase();
  return (
    text.includes("<!doctype html") ||
    text.includes("<html") ||
    text.includes("<body") ||
    text.includes("<header") ||
    text.includes("<main") ||
    text.includes("<div") ||
    text.includes("<section")
  );
}

function ResultSection({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? "rgba(255,212,0,0.03)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${accent ? "rgba(255,212,0,0.12)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: `1px solid ${accent ? "rgba(255,212,0,0.1)" : "rgba(255,255,255,0.05)"}`,
          background: accent ? "rgba(255,212,0,0.04)" : "rgba(255,255,255,0.02)",
        }}
      >
        <span style={{ color: accent ? "#FFD400" : "#9CA3AF" }}>{SECTION_ICONS[label]}</span>
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            color: accent ? "#FFD400" : "#9CA3AF",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ padding: "16px" }}>{children}</div>
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
        background: type === "success" ? "rgba(16,185,129,0.12)" : "rgba(179,0,23,0.12)",
        border: `1px solid ${type === "success" ? "rgba(16,185,129,0.3)" : "rgba(179,0,23,0.35)"}`,
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
          boxShadow: `0 0 8px ${type === "success" ? "#10B981" : "#B30017"}`,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#FFFFFF", flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0, fontSize: "16px" }}>
        ×
      </button>
    </div>
  );
}

export default function AIAssistantPage() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("Beginner");
  const [duration, setDuration] = useState("20 Minutes");
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [result, setResult] = useState<AIContent | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const generate = async () => {
    if (!topic.trim()) {
      showToast("Please enter a topic to generate.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/ai/classroom-assistant", { topic, level, duration });
      setResult(response.data.content);
    } catch (error) {
      console.error(error);
      showToast("Failed to generate task. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const startAssignment = async () => {
    if (!sessionCode.trim()) {
      showToast("Session code is required.", "error");
      return;
    }

    try {
      setStarting(true);
      await api.post("/ai/start-class", { sessionCode, topic, level, duration });
      showToast("Assignment started successfully.", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to start assignment.", "error");
    } finally {
      setStarting(false);
    }
  };

  const normalizedStarterCode = normalizeText(result?.starterCode);

  const copyCode = () => {
    if (normalizedStarterCode) {
      navigator.clipboard.writeText(normalizedStarterCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    background: focusedField === field ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${focusedField === field ? "rgba(179,0,23,0.5)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#FFFFFF",
    fontSize: "13.5px",
    fontFamily: "'Space Grotesk', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "all 0.2s ease",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(179,0,23,0.1)" : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
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
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(179,0,23,0.3); }
          50% { box-shadow: 0 0 36px rgba(179,0,23,0.6); }
        }
        ::placeholder { color: rgba(255,255,255,0.2); }
        option { background: #1a1a1a; color: #ffffff; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px", animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
            AI-Powered
          </p>
          <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#FFFFFF", margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Classroom Assistant
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, lineHeight: 1.6 }}>
            Generate complete classroom activities, starter code, and evaluation criteria instantly.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
            position: "relative",
            overflow: "hidden",
            animation: "fadeUp 0.45s ease 0.08s forwards",
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
              background: "linear-gradient(90deg, #B30017, #FFD400, transparent)",
            }}
          />

          <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 20px" }}>
            Configure Task
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* Topic */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", fontWeight: 500, marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Topic
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: focusedField === "topic" ? "#B30017" : "rgba(255,255,255,0.2)",
                    transition: "color 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                  </svg>
                </div>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onFocus={() => setFocusedField("topic")}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                  placeholder="e.g. HTML Forms, CSS Flexbox, JavaScript Arrays..."
                  style={{ ...inputStyle("topic"), paddingLeft: "40px" }}
                />
              </div>
            </div>

            {/* Level */}
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", fontWeight: 500, marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Level
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {LEVELS.map((l) => {
                  const cfg = LEVEL_CONFIG[l];
                  const active = level === l;
                  return (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      style={{
                        flex: 1,
                        padding: "10px 8px",
                        borderRadius: "8px",
                        background: active ? cfg.bg : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.07)"}`,
                        color: active ? cfg.color : "#9CA3AF",
                        fontSize: "11.5px",
                        fontWeight: active ? 700 : 500,
                        fontFamily: "'Space Grotesk', sans-serif",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        boxShadow: active ? `0 0 12px ${cfg.bg}` : "none",
                      }}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", fontWeight: 500, marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Duration
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {DURATIONS.map((d) => {
                  const active = duration === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "8px",
                        background: active ? "rgba(255,212,0,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? "rgba(255,212,0,0.3)" : "rgba(255,255,255,0.07)"}`,
                        color: active ? "#FFD400" : "#9CA3AF",
                        fontSize: "11.5px",
                        fontWeight: active ? 700 : 500,
                        fontFamily: "'Space Grotesk', sans-serif",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Code */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", fontWeight: 500, marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Session Code
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: focusedField === "session" ? "#B30017" : "rgba(255,255,255,0.2)",
                    transition: "color 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  onFocus={() => setFocusedField("session")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. TEST123"
                  style={{
                    ...inputStyle("session"),
                    paddingLeft: "40px",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px 20px",
              borderRadius: "12px",
              background: loading ? "rgba(179,0,23,0.4)" : "linear-gradient(135deg, #B30017 0%, #8B0012 100%)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              animation: !loading ? "pulse-glow 3s ease infinite" : "none",
              boxShadow: loading ? "none" : "0 0 24px rgba(179,0,23,0.35)",
              letterSpacing: "0.02em",
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Generating with AI...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                Generate AI Task
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
            {/* Result Header */}
            <div
              style={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "16px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, #FFD400, #B30017, transparent)",
                }}
              />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 500, color: "#FFD400", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
                    ✦ Generated Task
                  </p>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.01em" }}>
                    {result.title}
                  </h2>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background: LEVEL_CONFIG[level].bg,
                        border: `1px solid ${LEVEL_CONFIG[level].border}`,
                        fontSize: "11px",
                        color: LEVEL_CONFIG[level].color,
                        fontWeight: 600,
                      }}
                    >
                      {level}
                    </span>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "11px",
                        color: "#9CA3AF",
                        fontWeight: 500,
                      }}
                    >
                      {duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={startAssignment}
                  disabled={starting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 22px",
                    borderRadius: "12px",
                    background: starting ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.12)",
                    border: `1px solid ${starting ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.3)"}`,
                    color: "#10B981",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: starting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!starting) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.2)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!starting) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.12)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.3)";
                    }
                  }}
                >
                  {starting ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Starting...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Start Assignment
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content Sections */}
            <div style={{ display: "grid", gap: "12px" }}>
              <ResultSection label="Explanation">
                <p style={{ fontSize: "13.5px", color: "#D1D5DB", lineHeight: 1.75, margin: 0, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: "pre-wrap" }}>
                  {normalizeText(result.explanation)}
                </p>
              </ResultSection>

              <ResultSection label="Instructions">
                <p style={{ fontSize: "13.5px", color: "#D1D5DB", lineHeight: 1.75, margin: 0, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: "pre-wrap" }}>
                  {normalizeText(result.instructions)}
                </p>
              </ResultSection>

              <ResultSection label="Starter Code">
                <div style={{ position: "relative" }}>
                  <button
                    onClick={copyCode}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                      color: copied ? "#10B981" : "#9CA3AF",
                      fontSize: "11px",
                      fontFamily: "'Space Grotesk', sans-serif",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      zIndex: 2,
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                  <pre
                    style={{
                      margin: 0,
                      padding: "16px",
                      background: "#0A0A0A",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#E2E8F0",
                      overflowX: "auto",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {normalizedStarterCode}
                  </pre>
                </div>
              </ResultSection>

              <ResultSection label="Expected Output">
                {isHtmlLike(result.expectedOutput) ? (
                  <iframe
                    title="Expected Output Preview"
                    srcDoc={normalizeText(result.expectedOutput)}
                    className="w-full"
                    style={{
                      width: "100%",
                      minHeight: "260px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      background: "#FFFFFF",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "16px",
                      background: "#0A0A0A",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: "#D1D5DB",
                      lineHeight: 1.75,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                    }}
                  >
                    {normalizeText(result.expectedOutput)}
                  </div>
                )}
              </ResultSection>

              {result.evaluationCriteria && (
                <ResultSection label="Evaluation Criteria" accent>
                  <p style={{ fontSize: "13.5px", color: "#D1D5DB", lineHeight: 1.75, margin: 0, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: "pre-wrap" }}>
                    {normalizeText(result.evaluationCriteria)}
                  </p>
                </ResultSection>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}