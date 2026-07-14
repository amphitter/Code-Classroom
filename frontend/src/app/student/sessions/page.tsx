"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

/* ─── Types ─────────────────────────────────────────────── */
interface Session {
  _id: string;
  title: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
}

interface SessionItem {
  attendanceId: string;
  joinedAt: string;
  session: Session;
}

interface Stats {
  totalScore: number;
  rank: number;
  submissions: number;
  sessionsJoined: number;
}

interface LeaderboardEntry {
  studentId?: string;
  _id?: string;
  name: string;
  rollNo: string;
  totalScore: number;
  score?: number;
}

interface Submission {
  _id: string;
  taskId?: { title: string };
  fileName: string;
  score: number | null;
  status: string;
  createdAt: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        background: type === "success" ? "rgba(16,185,129,0.12)" : "rgba(179,0,23,0.12)",
        border: `1px solid ${type === "success" ? "rgba(16,185,129,0.3)" : "rgba(179,0,23,0.35)"}`,
        borderRadius: "14px",
        padding: "14px 20px",
        color: "#fff",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "13.5px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "slideUp 0.3s ease",
        maxWidth: "360px",
      }}
    >
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: type === "success" ? "#10B981" : "#B30017", boxShadow: `0 0 8px ${type === "success" ? "#10B981" : "#B30017"}`, flexShrink: 0 }} />
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "16px", padding: 0, marginLeft: "auto" }}>×</button>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
function Shimmer({ w = "100%", h = "14px", r = "7px" }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(255,255,255,0.05)", animation: "shimmer 1.5s ease infinite" }} />;
}

/* ─── Status Badge ───────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const cfg =
    s === "evaluated" || s === "graded"
      ? { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", color: "#10B981", dot: "#10B981" }
      : s === "pending"
      ? { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#F59E0B", dot: "#F59E0B" }
      : { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", color: "#9CA3AF", dot: "#9CA3AF" };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "20px", background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: "11px", fontWeight: 600, color: cfg.color, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {status || "Unknown"}
    </span>
  );
}

/* ─── Score Pill ─────────────────────────────────────────── */
function ScorePill({ score }: { score: number | null }) {
  if (score === null || score === undefined) return <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>—</span>;
  const color = score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#FF4D5E";
  return <span style={{ fontSize: "13.5px", fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{score}<span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginLeft: "2px" }}>pts</span></span>;
}

/* ─── Rank Config ────────────────────────────────────────── */
const RANK_CFG: Record<number, { color: string; bg: string; border: string; glow: string; icon: string }> = {
  0: { color: "#FFD400", bg: "rgba(255,212,0,0.08)", border: "rgba(255,212,0,0.25)", glow: "rgba(255,212,0,0.35)", icon: "🥇" },
  1: { color: "#C0C0C0", bg: "rgba(192,192,192,0.07)", border: "rgba(192,192,192,0.2)", glow: "rgba(192,192,192,0.25)", icon: "🥈" },
  2: { color: "#CD7F32", bg: "rgba(205,127,50,0.07)", border: "rgba(205,127,50,0.2)", glow: "rgba(205,127,50,0.25)", icon: "🥉" },
};

/* ─── Pagination ─────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onPage, onPageSize }: { page: number; total: number; pageSize: number; onPage: (p: number) => void; onPageSize: (s: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  const visible = Array.from({ length: Math.min(5, pages) }, (_, i) => Math.max(1, Math.min(pages - 4, safePage - 2)) + i);

  const btnBase: React.CSSProperties = { background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#9CA3AF", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif" };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Showing {start}–{end} of {total}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} style={{ ...btnBase, padding: "6px 10px" }}>
          {[10, 25, 50].map((s) => <option key={s} value={s}>{s}/page</option>)}
        </select>
        <button onClick={() => onPage(safePage - 1)} disabled={safePage === 1} style={{ ...btnBase, color: safePage === 1 ? "#333" : "#9CA3AF", cursor: safePage === 1 ? "not-allowed" : "pointer" }}>Prev</button>
        {visible.map((p) => (
          <button key={p} onClick={() => onPage(p)} style={{ ...btnBase, background: p === safePage ? "#B30017" : "transparent", borderColor: p === safePage ? "#B30017" : "rgba(255,255,255,0.08)", color: p === safePage ? "#fff" : "#9CA3AF", minWidth: "32px" }}>{p}</button>
        ))}
        <button onClick={() => onPage(safePage + 1)} disabled={safePage === pages} style={{ ...btnBase, color: safePage === pages ? "#333" : "#9CA3AF", cursor: safePage === pages ? "not-allowed" : "pointer" }}>Next</button>
      </div>
    </div>
  );
}

/* ─── Section Shell ──────────────────────────────────────── */
function Section({ title, badge, children, delay = 0 }: { title: string; badge?: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden", animation: `fadeUp 0.45s ease ${delay}ms forwards`, opacity: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>{title}</p>
        {badge}
      </div>
      {children}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function StudentSessionsPage() {
  const router = useRouter();

  /* state */
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [sessionCode, setSessionCode] = useState("");
  const [studentName, setStudentName] = useState("Student");
  const [timeOfDay, setTimeOfDay] = useState("Welcome back");
  const [stats, setStats] = useState<Stats>({ totalScore: 0, rank: 0, submissions: 0, sessionsJoined: 0 });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  /* sessions pagination */
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(10);

  /* leaderboard */
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbSearch, setLbSearch] = useState("");
  const [lbPage, setLbPage] = useState(1);
  const [lbPageSize, setLbPageSize] = useState(10);

  /* submissions */
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [subPage, setSubPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState(10);

  /* code focus */
  const [codeFocused, setCodeFocused] = useState(false);

  /* ── Load ── */
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) { try { const p = JSON.parse(user); setStudentName(p.name || "Student"); } catch {} }
    const h = new Date().getHours();
    setTimeOfDay(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    loadAll();
  }, []);

  const loadAll = () => { loadStats(); loadSessions(); loadLeaderboard(); loadSubmissions(); };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/student/stats");
      const d = res.data?.stats ?? res.data ?? {};
      setStats({ totalScore: Number(d.totalScore ?? 0), rank: Number(d.rank ?? 0), submissions: Number(d.submissions ?? 0), sessionsJoined: Number(d.sessionsJoined ?? 0) });
    } catch { setStats({ totalScore: 0, rank: 0, submissions: 0, sessionsJoined: 0 }); }
    finally { setStatsLoading(false); }
  };

  const loadSessions = async () => {
    try { setLoading(true); const r = await api.get("/student/sessions"); setSessions(r.data.sessions || []); }
    catch { setSessions([]); }
    finally { setLoading(false); }
  };

  const loadLeaderboard = async () => {
    try {
      setLbLoading(true);
      const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID || "";
      const endpoint = SESSION_ID ? `/leaderboard/${SESSION_ID}` : "/leaderboard/global";
      const r = await api.get(endpoint);
      setLeaderboard(r.data.leaderboard || []);
    } catch { setLeaderboard([]); }
    finally { setLbLoading(false); }
  };

  const loadSubmissions = async () => {
    try {
      setSubLoading(true);
      const token = localStorage.getItem("token");
      const r = await api.get("/submission/my-submissions", { headers: { Authorization: `Bearer ${token}` } });
      setSubmissions(r.data.submissions || []);
    } catch { setSubmissions([]); }
    finally { setSubLoading(false); }
  };

  const joinSession = async () => {
    if (!sessionCode.trim()) { setToast({ msg: "Enter a session code", type: "error" }); return; }
    try {
      setJoining(true);
      const res = await api.post("/student/join", { sessionCode });
      setSessionCode("");
      await loadSessions();
      await loadStats();
      setToast({ msg: "Session joined successfully!", type: "success" });
      const joined = res?.data?.session;
      if (joined?._id) setTimeout(() => router.push(`/student/session/${joined._id}/dashboard`), 800);
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message || "Failed to join session", type: "error" });
    } finally { setJoining(false); }
  };

  /* ── Filtered / Paginated ── */
  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.session.title.toLowerCase().includes(q) || s.session.code.toLowerCase().includes(q));
  }, [sessions, sessionSearch]);

  const filteredLb = useMemo(() => {
    const q = lbSearch.trim().toLowerCase();
    if (!q) return leaderboard;
    return leaderboard.filter((e) => e.name.toLowerCase().includes(q) || e.rollNo?.toLowerCase().includes(q));
  }, [leaderboard, lbSearch]);

  const paginatedSessions = filteredSessions.slice((sessionPage - 1) * sessionPageSize, sessionPage * sessionPageSize);
  const paginatedLb = filteredLb.slice((lbPage - 1) * lbPageSize, lbPage * lbPageSize);
  const paginatedSub = submissions.slice((subPage - 1) * subPageSize, subPage * subPageSize);

  const initials = studentName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const STAT_CARDS = [
    { label: "Total Score", value: stats.totalScore, accent: "#FFD400", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
    { label: "Global Rank", value: stats.rank ? `#${stats.rank}` : "—", accent: "#10B981", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    { label: "Submissions", value: stats.submissions, accent: "#3B82F6", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
    { label: "Sessions", value: stats.sessionsJoined, accent: "#8B5CF6", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .row-hover:hover td { background:rgba(255,255,255,0.02) !important; }
        .sess-card:hover { background:#161616 !important; border-color:rgba(255,255,255,0.12) !important; transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.3); }
        .sess-card { transition:all 0.2s ease !important; }
        ::placeholder { color:rgba(255,255,255,0.2); }
        select option { background:#1a1a1a; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", display: "flex", flexDirection: "column", gap: "20px", padding: "40px" }}>

        {/* ── Hero ── */}
        <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px 32px", position: "relative", overflow: "hidden", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #B30017, #FFD400 60%, transparent)" }} />
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, rgba(179,0,23,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ width: "58px", height: "58px", borderRadius: "50%", background: "linear-gradient(135deg, #B30017, #FF4D63)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 800, flexShrink: 0, boxShadow: "0 0 24px rgba(179,0,23,0.35)" }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 4px", letterSpacing: "0.06em" }}>{timeOfDay} 👋</p>
              <h1 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", color: "#FFFFFF" }}>{studentName}</h1>
            </div>
            <div style={{ display: "flex", gap: "7px", alignItems: "center", padding: "7px 14px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981", animation: "pulse-dot 2s infinite" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#10B981" }}>Online</span>
            </div>
          </div>
        </div>

      

        {/* ── Join + Sessions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>

          {/* Join Session */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "24px", position: "relative", overflow: "hidden", animation: "fadeUp 0.45s ease 0.2s forwards", opacity: 0, height: "14.7rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #B30017, transparent)" }} />
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Join Session</p>
            <div style={{ position: "relative", marginBottom: "10px", marginTop: "40px" }}>
              <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: codeFocused ? "#B30017" : "rgba(255,255,255,0.2)", transition: "color 0.2s ease", pointerEvents: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <input
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinSession()}
                onFocus={() => setCodeFocused(true)}
                onBlur={() => setCodeFocused(false)}
                placeholder="Session Code (e.g. ABC123)"
                style={{ width: "100%", background: codeFocused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", border: `1px solid ${codeFocused ? "rgba(179,0,23,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "12px 16px 12px 38px", color: "#fff", fontSize: "13.5px", fontFamily: "'JetBrains Mono', monospace", outline: "none", boxSizing: "border-box", transition: "all 0.2s ease", letterSpacing: "0.08em", boxShadow: codeFocused ? "0 0 0 3px rgba(179,0,23,0.1)" : "none" }}
              />
            </div>
            <button
              onClick={joinSession}
              disabled={joining}
              style={{ width: "100%", padding: "13px", borderRadius: "10px", background: joining ? "rgba(179,0,23,0.4)" : "linear-gradient(135deg, #B30017, #8B0012)", border: "none", color: "#fff", fontSize: "13.5px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", cursor: joining ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: joining ? "none" : "0 0 20px rgba(179,0,23,0.3)", transition: "all 0.2s ease" }}
            >
              {joining ? (<><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Joining...</>) : (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>Join Session</>)}
            </button>

            {/* Quick Links */}
            
          </div>

          {/* My Sessions */}
          <Section title="My Sessions" delay={220} badge={
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input value={sessionSearch} onChange={(e) => { setSessionSearch(e.target.value); setSessionPage(1); }} placeholder="Search..." style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 12px", color: "#fff", fontSize: "12px", outline: "none", width: "150px", fontFamily: "'Space Grotesk', sans-serif" }} />
              <button onClick={loadSessions} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#9CA3AF", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif" }}>↻</button>
            </div>
          }>
            {loading ? (
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[0, 1, 2].map((i) => (<div key={i} style={{ padding: "18px", background: "#0F0F0F", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}><Shimmer w="60%" h="14px" /><Shimmer w="40%" h="11px" /></div>))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>📚</div>
                <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>{sessionSearch ? "No sessions match your search" : "Join a session using the code"}</p>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px", padding: "16px" }}>
                  {paginatedSessions.map((item) => (
                    <div key={item.attendanceId} className="sess-card" onClick={() => router.push(`/student/sessions/${item.session._id}`)}
                      style={{ background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3, flex: 1 }}>{item.session.title}</p>
                        <span style={{ padding: "3px 9px", borderRadius: "20px", fontSize: "10.5px", fontWeight: 600, background: item.session.isActive ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: item.session.isActive ? "#10B981" : "#9CA3AF", border: `1px solid ${item.session.isActive ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`, flexShrink: 0, whiteSpace: "nowrap" }}>
                          {item.session.isActive ? "● Active" : "Ended"}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <p style={{ margin: 0, color: "#9CA3AF", fontSize: "11.5px" }}>Code: <span style={{ color: "#FFD400", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{item.session.code}</span></p>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>{new Date(item.joinedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                        <span style={{ color: "#FFD400", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>Open <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredSessions.length > sessionPageSize && <Pagination page={sessionPage} total={filteredSessions.length} pageSize={sessionPageSize} onPage={setSessionPage} onPageSize={(s) => { setSessionPageSize(s); setSessionPage(1); }} />}
              </>
            )}
          </Section>
        </div>

        {/* ── Leaderboard ── */}
        <Section title="Leaderboard" delay={300} badge={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input value={lbSearch} onChange={(e) => { setLbSearch(e.target.value); setLbPage(1); }} placeholder="Search..." style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 12px", color: "#fff", fontSize: "12px", outline: "none", width: "140px", fontFamily: "'Space Grotesk', sans-serif" }} />
            <button onClick={loadLeaderboard} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#9CA3AF", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}>↻</button>
            {!lbLoading && <span style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(255,212,0,0.1)", border: "1px solid rgba(255,212,0,0.25)", fontSize: "11px", color: "#FFD400", fontWeight: 600 }}>{leaderboard.length}</span>}
          </div>
        }>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Rank", "Student", "Roll No", "Score"].map((h) => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: "10.5px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lbLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {[10, 40, 28, 20].map((w, j) => <td key={j} style={{ padding: "14px 18px" }}><Shimmer w={`${w}%`} h="12px" /></td>)}
                    </tr>
                  ))
                ) : filteredLb.length === 0 ? (
                  <tr><td colSpan={4}><div style={{ padding: "48px 24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>No leaderboard data yet</div></td></tr>
                ) : (
                  paginatedLb.map((entry, idx) => {
                    const globalIdx = (lbPage - 1) * lbPageSize + idx;
                    const isTop = globalIdx < 3;
                    const cfg = RANK_CFG[globalIdx];
                    return (
                      <tr key={entry.studentId || entry._id || idx} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: isTop ? cfg.bg : "transparent" }}>
                        <td style={{ padding: "13px 18px", width: "60px" }}>
                          {isTop ? <span style={{ fontSize: "18px" }}>{cfg.icon}</span> : <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>#{globalIdx + 1}</span>}
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: isTop ? cfg.bg : "rgba(255,255,255,0.05)", border: `1px solid ${isTop ? cfg.border : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: isTop ? cfg.color : "#9CA3AF", flexShrink: 0, boxShadow: isTop ? `0 0 8px ${cfg.glow}` : "none" }}>
                              {entry.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span style={{ fontSize: "13.5px", fontWeight: isTop ? 700 : 500, color: "#FFFFFF" }}>{entry.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.07)" }}>{entry.rollNo || "—"}</span>
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: isTop ? cfg.color : "#FFFFFF", textShadow: isTop ? `0 0 10px ${cfg.glow}` : "none" }}>{entry.totalScore ?? entry.score ?? 0}<span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginLeft: "2px", fontWeight: 400 }}>pts</span></span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredLb.length > lbPageSize && <Pagination page={lbPage} total={filteredLb.length} pageSize={lbPageSize} onPage={setLbPage} onPageSize={(s) => { setLbPageSize(s); setLbPage(1); }} />}
        </Section>

        {/* ── Submissions ── */}
        <Section title="My Submissions" delay={380} badge={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={loadSubmissions} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#9CA3AF", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}>↻</button>
            {!subLoading && <span style={{ padding: "3px 10px", borderRadius: "20px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", fontSize: "11px", color: "#3B82F6", fontWeight: 600 }}>{submissions.length}</span>}
          </div>
        }>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Task", "File", "Score", "Status", "Submitted"].map((h) => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: "10.5px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {[45, 35, 15, 25, 30].map((w, j) => <td key={j} style={{ padding: "14px 18px" }}><Shimmer w={`${w}%`} h="12px" /></td>)}
                    </tr>
                  ))
                ) : submissions.length === 0 ? (
                  <tr><td colSpan={5}><div style={{ padding: "48px 24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>No submissions yet. Complete a task to see it here.</div></td></tr>
                ) : (
                  paginatedSub.map((item, i) => {
                    const { date, time } = formatDate(item.createdAt);
                    return (
                      <tr key={item._id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", animationDelay: `${i * 30}ms`, animation: "fadeUp 0.35s ease forwards", opacity: 0 }}>
                        <td style={{ padding: "13px 18px" }}>
                          <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#FFFFFF", margin: 0, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.taskId?.title || "—"}</p>
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <span style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.fileName || "—"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 18px" }}><ScorePill score={item.score} /></td>
                        <td style={{ padding: "13px 18px" }}><StatusBadge status={item.status} /></td>
                        <td style={{ padding: "13px 18px" }}>
                          <p style={{ fontSize: "12.5px", color: "#E5E7EB", margin: 0, fontWeight: 500 }}>{date}</p>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: "2px 0 0" }}>{time}</p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {submissions.length > subPageSize && <Pagination page={subPage} total={submissions.length} pageSize={subPageSize} onPage={setSubPage} onPageSize={(s) => { setSubPageSize(s); setSubPage(1); }} />}
        </Section>

      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}