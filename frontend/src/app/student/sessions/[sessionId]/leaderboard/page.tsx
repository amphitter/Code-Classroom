"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";


/* ── Types ─────────────────────────────────────────────── */
interface LeaderboardEntry {
  studentId: string;
  name: string;
  rollNo: string;
  totalScore: number;
}

interface Student {
  id: string;
}

/* ── Constants ──────────────────────────────────────────── */
const MEDAL: Record<number, { bg: string; text: string; border: string; glow: string }> = {
  1: { bg: "rgba(255,212,0,0.08)", text: "#FFD400", border: "rgba(255,212,0,0.25)", glow: "rgba(255,212,0,0.35)" },
  2: { bg: "rgba(192,192,200,0.08)", text: "#C0C0C8", border: "rgba(192,192,200,0.22)", glow: "rgba(192,192,200,0.25)" },
  3: { bg: "rgba(205,124,58,0.08)", text: "#CD7C3A", border: "rgba(205,124,58,0.22)", glow: "rgba(205,124,58,0.25)" },
};

/* ── SVG Icons ──────────────────────────────────────────── */
const Icons = {
  refresh: (spinning: boolean) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spinning ? "spin 0.8s linear infinite" : "none" }}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  trophy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  bars: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  rank1: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  rank2: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  rank3: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

const RANK_ICONS: Record<number, React.ReactNode> = {
  1: Icons.rank1,
  2: Icons.rank2,
  3: Icons.rank3,
};

/* ── Helpers ────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Score Bar ──────────────────────────────────────────── */
function ScoreBar({ score, max, isMe, color }: { score: number; max: number; isMe: boolean; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;
  const barColor = color || (isMe ? "linear-gradient(90deg,#B30017,#FFD400)" : "rgba(255,255,255,0.15)");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "13.5px", fontWeight: 800, color: isMe ? "#FFD400" : "#FFFFFF", fontFamily: "'Space Grotesk', sans-serif", minWidth: "36px", textAlign: "right" }}>
        {score}
      </span>
      <div style={{ position: "relative", height: "4px", width: "120px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${pct}%`, borderRadius: "999px", background: barColor, transition: "width 0.85s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}>pts</span>
    </div>
  );
}

/* ── Skeleton Row ───────────────────────────────────────── */
function SkeletonRow({ i }: { i: number }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {[8, 35, 24, 28].map((w, j) => (
        <td key={j} style={{ padding: "15px 20px" }}>
          <div style={{ height: "12px", width: `${w}%`, borderRadius: "6px", background: "rgba(255,255,255,0.05)", animation: `shimmer 1.5s ease ${i * 70}ms infinite` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Podium Card ────────────────────────────────────────── */
function PodiumCard({ entry, rank, barH }: { entry: LeaderboardEntry; rank: number; barH: number }) {
  const m = MEDAL[rank];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "90px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: m.bg, border: `2px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: m.text, fontFamily: "'Space Grotesk', sans-serif", boxShadow: `0 0 12px ${m.glow}` }}>
        {initials(entry.name)}
      </div>
      <p style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: 0, textAlign: "center", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Space Grotesk', sans-serif" }}>
        {entry.name.split(" ")[0]}
      </p>
      <p style={{ fontSize: "11px", fontWeight: 800, color: m.text, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
        {entry.totalScore}
      </p>
      <div style={{ width: "100%", height: `${barH}px`, borderRadius: "8px 8px 0 0", background: m.bg, border: `1px solid ${m.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: m.text }}>
        {RANK_ICONS[rank]}
      </div>
    </div>
  );
}

/* ── My Rank Card ───────────────────────────────────────── */
function MyRankCard({ rank, loading, entry, total }: { rank: number | null; loading: boolean; entry: LeaderboardEntry | undefined; total: number }) {
  const percentile = rank !== null && total > 1 ? Math.round(((total - rank) / total) * 100) : null;

  return (
    <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #B30017, #FFD400 60%, transparent)" }} />
      <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(179,0,23,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px" }}>

        {/* Rank */}
        <div style={{ minWidth: "80px" }}>
          <p style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "'JetBrains Mono', monospace" }}>Your Position</p>
          {loading ? (
            <div style={{ height: "48px", width: "72px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s ease infinite" }} />
          ) : rank ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
              <span style={{ fontSize: "42px", fontWeight: 900, color: "#FFFFFF", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, letterSpacing: "-0.03em" }}>#{rank}</span>
              {MEDAL[rank] && (
                <span style={{ color: MEDAL[rank].text, marginBottom: "4px" }}>
                  {RANK_ICONS[rank]}
                </span>
              )}
            </div>
          ) : (
            <span style={{ fontSize: "36px", fontWeight: 900, color: "rgba(255,255,255,0.15)", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>—</span>
          )}
        </div>

        <div style={{ width: "1px", height: "48px", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

        {/* Student Info */}
        {entry && (
          <div>
            <p style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "'JetBrains Mono', monospace" }}>Student</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 6px", fontFamily: "'Space Grotesk', sans-serif" }}>{entry.name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "10px", color: "#9CA3AF", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontFamily: "'JetBrains Mono', monospace" }}>{entry.rollNo}</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#FFD400", fontFamily: "'Space Grotesk', sans-serif" }}>{entry.totalScore} pts</span>
            </div>
          </div>
        )}

        {percentile !== null && (
          <>
            <div style={{ width: "1px", height: "48px", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "'JetBrains Mono', monospace" }}>Percentile</p>
              <p style={{ fontSize: "28px", fontWeight: 900, color: "#B30017", margin: 0, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>Top {100 - percentile}%</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", margin: "4px 0 0" }}>Ahead of {percentile}% of participants</p>
            </div>
          </>
        )}

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>Total</p>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{total}</p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", margin: "2px 0 0" }}>participants</p>
        </div>
      </div>

      {!loading && total <= 1 && (
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
            Waiting for other participants · Rankings update automatically
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Live Pill ──────────────────────────────────────────── */
function LivePill({ active }: { active: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "20px", background: active ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}` }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? "#10B981" : "rgba(255,255,255,0.2)", boxShadow: active ? "0 0 6px #10B981" : "none", animation: active ? "pulse-dot 2s infinite" : "none" }} />
      <span style={{ fontSize: "10px", fontWeight: 600, color: active ? "#10B981" : "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
        {active ? "Live" : "Offline"}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function StudentLeaderboardPage() {
  const params = useParams();
  const rawSessionId = params?.sessionId;
  const SESSION_ID = Array.isArray(rawSessionId) ? rawSessionId[0] : (rawSessionId as string) || process.env.NEXT_PUBLIC_SESSION_ID || "";

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | undefined>();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadLeaderboard = useCallback(async () => {
    if (!SESSION_ID) return;
    setLoading(true);
    try {
      const response = await api.get(`/leaderboard/${SESSION_ID}`);
      const data: LeaderboardEntry[] = response.data.leaderboard ?? [];
      setLeaderboard(data);
      setLastUpdated(new Date());
      setMyRank(null);
      setMyEntry(undefined);
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const student: Student = JSON.parse(stored);
          const idx = data.findIndex((item) => item.studentId === student.id);
          if (idx !== -1) { setMyRank(idx + 1); setMyEntry(data[idx]); }
        } catch {}
      }
    } catch (err) {
      console.error("[Leaderboard] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [SESSION_ID]);

  useEffect(() => {
    loadLeaderboard();
    socket.connect();
    setConnected(socket.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onEval = () => loadLeaderboard();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("evaluation_completed", onEval);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("evaluation_completed", onEval);
    };
  }, [loadLeaderboard]);

  const maxScore = leaderboard[0]?.totalScore ?? 1;
  const top3 = leaderboard.slice(0, 3);
  const isSingle = !loading && leaderboard.length === 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes slideRow { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .lb-row:hover td { background:rgba(255,255,255,0.02) !important; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", animation: "fadeUp 0.4s ease forwards" }}>
          <div>
            <p style={{ fontSize: "9px", fontWeight: 600, color: "#B30017", letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "'JetBrains Mono', monospace" }}>
              Code Build Launch
            </p>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 900, color: "#FFFFFF", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Leaderboard
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <LivePill active={connected} />
            {lastUpdated && (
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                Updated {formatTime(lastUpdated)}
              </span>
            )}
          </div>
        </div>

        {/* ── My Rank ── */}
        <div style={{ animation: "fadeUp 0.45s ease 0.06s forwards", opacity: 0 }}>
          <MyRankCard rank={myRank} loading={loading} entry={myEntry} total={leaderboard.length} />
        </div>

        {/* ── Podium ── */}
        {!loading && top3.length >= 2 && (
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", animation: "fadeUp 0.45s ease 0.12s forwards", opacity: 0 }}>
            <p style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.28em", textTransform: "uppercase", margin: "0 0 20px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
              Top {top3.length} Podium
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "12px" }}>
              {(top3.length >= 3
                ? [{ e: top3[1], r: 2, h: 80 }, { e: top3[0], r: 1, h: 120 }, { e: top3[2], r: 3, h: 60 }]
                : [{ e: top3[0], r: 1, h: 120 }, { e: top3[1], r: 2, h: 80 }]
              ).map(({ e, r, h }) => (
                <PodiumCard key={e.studentId} entry={e} rank={r} barH={h} />
              ))}
            </div>
          </div>
        )}

        {/* ── Full Table ── */}
        <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden", animation: "fadeUp 0.45s ease 0.18s forwards", opacity: 0 }}>

          {/* Table Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#9CA3AF" }}>{Icons.bars}</span>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                {loading ? "Loading…" : `${leaderboard.length} participant${leaderboard.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={loadLeaderboard}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF", cursor: loading ? "not-allowed" : "pointer", fontSize: "11px", fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.18s ease", opacity: loading ? 0.5 : 1 }}
              onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
            >
              {Icons.refresh(loading)}
              Refresh
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {[{ label: "Rank", w: "64px" }, { label: "Student" }, { label: "Roll No", w: "140px" }, { label: "Score", w: "200px" }].map(({ label, w }) => (
                    <th key={label} style={{ padding: "11px 20px", textAlign: "left", fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.18em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", fontFamily: "'JetBrains Mono', monospace", width: w, whiteSpace: "nowrap" }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} i={i} />)}

                {!loading && leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: "12px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)" }}>
                          {Icons.trophy}
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.25)", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>No rankings yet</p>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.12)", margin: 0 }}>Rankings appear once evaluations are completed</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && leaderboard.map((item, index) => {
                  const rank = index + 1;
                  const isMe = item.studentId === myEntry?.studentId;
                  const medal = MEDAL[rank];

                  return (
                    <tr
                      key={item.studentId}
                      className="lb-row"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isMe ? "linear-gradient(90deg, rgba(179,0,23,0.08), transparent)" : medal ? medal.bg : "transparent",
                        animationDelay: `${index * 35}ms`,
                        animation: "slideRow 0.35s ease forwards",
                        opacity: 0,
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "14px 20px" }}>
                        {medal ? (
                          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: medal.bg, border: `1px solid ${medal.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: medal.text, boxShadow: `0 0 8px ${medal.glow}` }}>
                            {RANK_ICONS[rank]}
                          </div>
                        ) : (
                          <span style={{ display: "inline-flex", width: "28px", height: "28px", alignItems: "center", justifyContent: "center", borderRadius: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                            {rank}
                          </span>
                        )}
                      </td>

                      {/* Student */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, background: medal ? medal.bg : isMe ? "rgba(179,0,23,0.12)" : "rgba(255,255,255,0.05)", border: `1.5px solid ${medal ? medal.border : isMe ? "rgba(179,0,23,0.35)" : "rgba(255,255,255,0.08)"}`, color: medal ? medal.text : isMe ? "#B30017" : "#9CA3AF", fontFamily: "'Space Grotesk', sans-serif", boxShadow: medal ? `0 0 10px ${medal.glow}` : "none" }}>
                            {initials(item.name)}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                            <span style={{ fontSize: "13.5px", fontWeight: medal ? 700 : isMe ? 700 : 500, color: medal ? medal.text : isMe ? "#FFFFFF" : "rgba(255,255,255,0.85)", fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.name}
                            </span>
                            {isMe && (
                              <span style={{ padding: "1px 7px", borderRadius: "5px", background: "rgba(179,0,23,0.2)", fontSize: "8px", fontWeight: 900, color: "#B30017", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Roll No */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: "11px", color: "#9CA3AF", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "2px 8px", borderRadius: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
                          {item.rollNo}
                        </span>
                      </td>

                      {/* Score */}
                      <td style={{ padding: "14px 20px" }}>
                        <ScoreBar score={item.totalScore} max={maxScore} isMe={isMe} color={medal ? `linear-gradient(90deg,${medal.text},${medal.text}80)` : undefined} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Single participant waiting state */}
          {isSingle && (
            <div style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "5px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", animation: `pulse-dot 1.4s ease-in-out ${i * 200}ms infinite` }} />
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
                You&apos;re the first to complete · Waiting for other participants
              </p>
            </div>
          )}

          {/* Footer */}
          {!loading && leaderboard.length > 1 && (
            <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.12)", textAlign: "center", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                Rankings update automatically via live socket · Code Build Launch
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}