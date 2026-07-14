"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
interface Session {
  _id: string;
  title: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
}

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  email: string;
  createdAt: string;
}

interface LeaderboardEntry {
  studentId: string;
  name: string;
  rollNo: string;
  totalScore: number;
}

interface Submission {
  _id: string;
  fileName: string;
  score: number | null;
  status: string;
  createdAt: string;
  student?: { name: string; rollNo: string };
  taskId?: { title: string } | string;
  session?: { _id: string; title: string; code: string };
}

interface Activity {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  session?: { _id: string; title: string; code: string };
}

interface Analytics {
  totalStudents: number;
  attendanceCount: number;
  totalTasks: number;
  averageScore: number;
  topPerformer?: { name: string; rollNo: string; score: number };
}

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function paginateList<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), pages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    total,
    pages,
    safePage,
    start,
    end,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ══════════════════════════════════════════════════════════
   SMALL COMPONENTS
══════════════════════════════════════════════════════════ */
function Shimmer({
  w = "100%",
  h = "13px",
  r = "7px",
}: {
  w?: string;
  h?: string;
  r?: string;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "rgba(255,255,255,0.05)",
        animation: "shimmer 1.5s ease infinite",
      }}
    />
  );
}

function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
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
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "13px 18px",
        borderRadius: "12px",
        background:
          type === "success"
            ? "rgba(16,185,129,0.12)"
            : "rgba(179,0,23,0.12)",
        border: `1px solid ${
          type === "success"
            ? "rgba(16,185,129,0.3)"
            : "rgba(179,0,23,0.35)"
        }`,
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "slideUp 0.3s ease",
        fontFamily: "'Space Grotesk', sans-serif",
        maxWidth: "340px",
      }}
    >
      <div
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: type === "success" ? "#10B981" : "#B30017",
          boxShadow: `0 0 7px ${
            type === "success" ? "#10B981" : "#B30017"
          }`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#FFFFFF",
          flex: 1,
        }}
      >
        {msg}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#9CA3AF",
          cursor: "pointer",
          fontSize: "16px",
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const cfg =
    s === "evaluated" || s === "graded"
      ? {
          bg: "rgba(16,185,129,0.1)",
          border: "rgba(16,185,129,0.25)",
          color: "#10B981",
          dot: "#10B981",
        }
      : s === "pending"
      ? {
          bg: "rgba(245,158,11,0.1)",
          border: "rgba(245,158,11,0.25)",
          color: "#F59E0B",
          dot: "#F59E0B",
        }
      : {
          bg: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.1)",
          color: "#9CA3AF",
          dot: "#9CA3AF",
        };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "20px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: "10.5px",
        fontWeight: 600,
        color: cfg.color,
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
          flexShrink: 0,
        }}
      />
      {status || "—"}
    </span>
  );
}

function SectionCard({
  title,
  badge,
  action,
  children,
  delay = 0,
}: {
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        overflow: "hidden",
        animationDelay: `${delay}ms`,
        animation: "fadeUp 0.45s ease forwards",
        opacity: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 13px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <p
            style={{
              fontSize: "10.5px",
              fontWeight: 600,
              color: "#9CA3AF",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {title}
          </p>
          {badge}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {cols.map((c) => (
          <th
            key={c}
            style={{
              padding: "10px 18px",
              textAlign: "left",
              fontSize: "9px",
              fontWeight: 600,
              color: "#9CA3AF",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.02)",
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "nowrap",
            }}
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const init = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = (name.charCodeAt(0) || 0) % 360;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `hsl(${hue},35%,22%)`,
        border: `1px solid hsl(${hue},35%,32%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${Math.floor(size * 0.36)}px`,
        fontWeight: 700,
        color: `hsl(${hue},55%,68%)`,
        fontFamily: "'Space Grotesk', sans-serif",
        flexShrink: 0,
      }}
    >
      {init}
    </div>
  );
}

function RefreshBtn({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 11px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#9CA3AF",
        cursor: "pointer",
        fontSize: "11px",
        fontFamily: "'Space Grotesk', sans-serif",
        transition: "all 0.18s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#FFF";
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.04)";
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }}
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      Refresh
    </button>
  );
}

function CountBadge({
  count,
  color = "#B30017",
}: {
  count: number;
  color?: string;
}) {
  return (
    <span
      style={{
        padding: "2px 9px",
        borderRadius: "20px",
        background: `${color}18`,
        border: `1px solid ${color}35`,
        fontSize: "10.5px",
        color,
        fontWeight: 700,
      }}
    >
      {count}
    </span>
  );
}

function ScoreBar({
  score,
  max,
  color,
}: {
  score: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 800,
          color: color || "#FFFFFF",
          fontFamily: "'Space Grotesk', sans-serif",
          minWidth: "32px",
          textAlign: "right",
        }}
      >
        {score}
      </span>
      <div
        style={{
          width: "90px",
          height: "4px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "999px",
            background: color
              ? `linear-gradient(90deg,${color},${color}80)`
              : "rgba(255,255,255,0.18)",
            transition: "width 0.7s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.2)" }}>
        pts
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
  index,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className="stat-card"
      style={{
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
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-24px",
          right: "-24px",
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px",
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
          {label}
        </p>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
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
      <p
        style={{
          fontSize: "26px",
          fontWeight: 700,
          color: accent,
          margin: 0,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function SessionCard({
  item,
  onOpen,
}: {
  item: Session;
  onOpen: () => void;
}) {
  return (
    <div className="session-card" onClick={onOpen}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: 1.3,
            flex: 1,
            paddingRight: "8px",
          }}
        >
          {item.title}
        </h3>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 600,
            background: item.isActive
              ? "rgba(0,255,128,0.12)"
              : "rgba(255,255,255,0.06)",
            color: item.isActive ? "#00FF80" : "#9CA3AF",
            border: `1px solid ${
              item.isActive
                ? "rgba(0,255,128,0.25)"
                : "rgba(255,255,255,0.1)"
            }`,
            flexShrink: 0,
          }}
        >
          {item.isActive ? "● Active" : "Ended"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <p style={{ margin: 0, color: "#9CA3AF", fontSize: "12px" }}>
          Code:{" "}
          <span
            style={{
              color: "#FFD400",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            {item.code}
          </span>
        </p>
        <p style={{ margin: 0, color: "#9CA3AF", fontSize: "12px" }}>
          Created:{" "}
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </p>
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            color: "#FFD400",
            fontWeight: 700,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          Open Session
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function TeacherSessionDashboardPage() {
  const [teacherName, setTeacherName] = useState("Teacher");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [createTitle, setCreateTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const [joinCode, setJoinCode] = useState("");

  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(8);

  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardPageSize, setLeaderboardPageSize] = useState(10);

  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);

  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionPage, setSubmissionPage] = useState(1);
  const [submissionPageSize, setSubmissionPageSize] = useState(10);

  const [activitySearch, setActivitySearch] = useState("");
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get("/session");
      const fetched: Session[] = res.data.sessions || [];
      setSessions(fetched);
      return fetched;
    } catch (error) {
      console.error(error);
      setSessions([]);
      return [];
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const res = await api.get("/student");
      setStudents(res.data.students || res.data || []);
    } catch (error) {
      console.error(error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const loadGlobalLeaderboard = useCallback(async () => {
    try {
      setLoadingLeaderboard(true);
      const res = await api.get("/leaderboard/global");
      setLeaderboard(res.data.leaderboard || []);
    } catch (error) {
      console.error(error);
      setLeaderboard([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  const loadGlobalSubmissions = useCallback(async (sessionList: Session[]) => {
    try {
      setLoadingSubmissions(true);

      if (!sessionList.length) {
        setSubmissions([]);
        return;
      }

      const chunks = await Promise.all(
        sessionList.map(async (session) => {
          try {
            const res = await api.get(`/submission/session/${session._id}`);
            const items = res.data.submissions || [];

            return items.map((item: Submission) => ({
              ...item,
              session: {
                _id: session._id,
                title: session.title,
                code: session.code,
              },
            }));
          } catch (error) {
            return [];
          }
        })
      );

      const flat = chunks.flat().sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });

      setSubmissions(flat);
    } catch (error) {
      console.error(error);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  const loadGlobalActivities = useCallback(async (sessionList: Session[]) => {
    try {
      setLoadingActivities(true);

      if (!sessionList.length) {
        setActivities([]);
        return;
      }

      const chunks = await Promise.all(
        sessionList.map(async (session) => {
          try {
            const res = await api.get(`/activity/${session._id}`);
            const items = res.data.activities || res.data || [];

            return items.map((item: Activity) => ({
              ...item,
              session: {
                _id: session._id,
                title: session.title,
                code: session.code,
              },
            }));
          } catch (error) {
            return [];
          }
        })
      );

      const flat = chunks.flat().sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });

      setActivities(flat);
    } catch (error) {
      console.error(error);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    const fetchedSessions = await loadSessions();
    await Promise.all([
      loadStudents(),
      loadGlobalLeaderboard(),
      loadGlobalSubmissions(fetchedSessions),
      loadGlobalActivities(fetchedSessions),
    ]);
  }, [
    loadSessions,
    loadStudents,
    loadGlobalLeaderboard,
    loadGlobalSubmissions,
    loadGlobalActivities,
  ]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setTeacherName(parsed.name || "Teacher");
      } catch {}
    }

    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    socket.connect();

    const handleConnect = () => setLiveConnected(true);
    const handleDisconnect = () => setLiveConnected(false);
    const handleRefresh = () => {
      void refreshAll();
    };

    setLiveConnected(socket.connected);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("evaluation_completed", handleRefresh);
    socket.on("task_created", handleRefresh);
    socket.on("activity_created", handleRefresh);
    socket.on("session_created", handleRefresh);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("evaluation_completed", handleRefresh);
      socket.off("task_created", handleRefresh);
      socket.off("activity_created", handleRefresh);
      socket.off("session_created", handleRefresh);
    };
  }, [refreshAll]);
const router = useRouter();
  const createSession = async () => {
    try {
      if (!createTitle.trim()) {
        setToast({
          msg: "Session title is required.",
          type: "error",
        });
        return;
      }

      setCreating(true);

      const res = await api.post("/session/create", {
        title: createTitle.trim(),
      });

      const created: Session =
        res.data.session || {
          _id: `${Date.now()}`,
          title: createTitle.trim(),
          code: "",
          isActive: true,
        };

      setCreateTitle("");
      setSessions((prev) => [created, ...prev]);
      setActiveSession(created);

      setToast({
        msg: "Session created successfully!",
        type: "success",
      });

      await refreshAll();
    } catch (error: any) {
      console.error(error);
      setToast({
        msg: error?.response?.data?.message || "Failed to create session.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

const openSession = (session: Session) => {
  router.push(`/teacher/sessions/${session._id}`);
};

  const joinSessionByCode = async () => {
    const code = joinCode.trim().toUpperCase();

    if (!code) {
      setToast({
        msg: "Enter a session code.",
        type: "error",
      });
      return;
    }

    let found = sessions.find(
      (s) => s.code.toUpperCase() === code
    );

    if (!found) {
      const refreshed = await loadSessions();
      found = refreshed.find(
        (s) => s.code.toUpperCase() === code
      );
    }

    if (!found) {
      setToast({
        msg: "No session found for that code.",
        type: "error",
      });
      return;
    }

    setActiveSession(found);
    setJoinCode("");
    setToast({
      msg: `Joined ${found.title}`,
      type: "success",
    });
  };

  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return sessions;

    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [sessions, sessionSearch]);

  const filteredLeaderboard = useMemo(() => {
    const q = leaderboardSearch.trim().toLowerCase();
    if (!q) return leaderboard;

    return leaderboard.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.rollNo.toLowerCase().includes(q)
    );
  }, [leaderboard, leaderboardSearch]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;

    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const filteredSubmissions = useMemo(() => {
    const q = submissionSearch.trim().toLowerCase();
    if (!q) return submissions;

    return submissions.filter((s) => {
      const sessionText = s.session?.title || s.session?.code || "";
      const taskText =
        typeof s.taskId === "object" && s.taskId
          ? s.taskId.title
          : "";
      const studentText = s.student?.name || "";
      return (
        sessionText.toLowerCase().includes(q) ||
        taskText.toLowerCase().includes(q) ||
        studentText.toLowerCase().includes(q) ||
        s.fileName.toLowerCase().includes(q)
      );
    });
  }, [submissions, submissionSearch]);

  const filteredActivities = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    if (!q) return activities;

    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.session?.title || "").toLowerCase().includes(q)
    );
  }, [activities, activitySearch]);

  const sessionsPageData = paginateList(
    filteredSessions,
    sessionPage,
    sessionPageSize
  );
  const leaderboardPageData = paginateList(
    filteredLeaderboard,
    leaderboardPage,
    leaderboardPageSize
  );
  const studentsPageData = paginateList(
    filteredStudents,
    studentPage,
    studentPageSize
  );
  const submissionsPageData = paginateList(
    filteredSubmissions,
    submissionPage,
    submissionPageSize
  );
  const activitiesPageData = paginateList(
    filteredActivities,
    activityPage,
    activityPageSize
  );

  const evaluatedSubmissions = submissions.filter(
    (s) => s.status?.toLowerCase() === "evaluated"
  );

  const averageScore = evaluatedSubmissions.length
    ? Math.round(
        evaluatedSubmissions.reduce(
          (sum, s) => sum + (s.score || 0),
          0
        ) / evaluatedSubmissions.length
      )
    : 0;

  const totalScore = evaluatedSubmissions.reduce(
    (sum, s) => sum + (s.score || 0),
    0
  );

  const stats = [
    {
      label: "Sessions",
      value: sessions.length,
      accent: "#FFD400",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M3 10h18" />
        </svg>
      ),
    },
    {
      label: "Students",
      value: students.length,
      accent: "#10B981",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: "Submissions",
      value: submissions.length,
      accent: "#3B82F6",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: "Avg Score",
      value: averageScore,
      accent: "#8B5CF6",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M9 17V9" />
          <path d="M14 17V4" />
          <path d="M19 17v-7" />
        </svg>
      ),
    },
  ];

  const topPerformer = leaderboard[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .stat-card {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 22px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          cursor: default;
          box-shadow: none;
        }

        .stat-card:hover {
          background: #161616;
          transform: translateY(-3px);
        }

        .session-card {
          background: #0F0F0F;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.22s ease;
          transform: translateY(0);
          box-shadow: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          min-height: 178px;
        }

        .session-card:hover {
          background: #161616;
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .row-hover {
          transition: background 0.15s ease;
        }

        .row-hover:hover {
          background: rgba(255,255,255,0.02);
        }

        input::placeholder{color:#555}
        select option{background:#1A1A1A}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{background:#222;border-radius:3px}
        ::-webkit-scrollbar-track{background:#0A0A0A}
      `}</style>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          color: "#fff",
          padding: "clamp(16px, 4vw, 36px)",
          fontFamily: "'Space Grotesk', sans-serif",
          maxWidth: "1500px",
          margin: "0 auto",
        }}
      >
        {/* HERO */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "22px",
            padding: "28px 32px",
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
              background: "linear-gradient(90deg, #B30017, #FFD400 60%, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(179,0,23,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #B30017, #FF4D63)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: "0 0 24px rgba(179,0,23,0.35)",
                }}
              >
                {initials(teacherName)}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9CA3AF",
                    margin: "0 0 4px",
                    letterSpacing: "0.06em",
                  }}
                >
                  Teacher Portal
                </p>
                <h1
                  style={{
                    fontSize: "clamp(22px, 3vw, 30px)",
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Welcome back, {teacherName}
                </h1>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: liveConnected
                  ? "rgba(0,255,128,0.08)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  liveConnected
                    ? "rgba(0,255,128,0.2)"
                    : "rgba(255,255,255,0.08)"
                }`,
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: liveConnected ? "#00FF80" : "#9CA3AF",
                  boxShadow: liveConnected ? "0 0 8px #00FF80" : "none",
                  animation: liveConnected ? "pulse-dot 2s infinite" : "none",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: liveConnected ? "#00FF80" : "#9CA3AF",
                }}
              >
                {liveConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {stats.map((item, index) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              accent={item.accent}
              index={index}
              icon={item.icon}
            />
          ))}
        </div>

        {/* CREATE / JOIN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease forwards",
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
            <p
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: "#9CA3AF",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 18px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Create Session
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontWeight: 500,
                    marginBottom: "7px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Session Title
                </label>
                <input
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createSession()}
                  placeholder="e.g. Web Development Bootcamp"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    fontSize: "13.5px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                onClick={createSession}
                disabled={creating}
                style={{
                  padding: "13px",
                  borderRadius: "10px",
                  background: creating
                    ? "rgba(179,0,23,0.4)"
                    : "linear-gradient(135deg,#B30017,#8B0012)",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  cursor: creating ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: creating ? "none" : "0 0 20px rgba(179,0,23,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                {creating ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Session
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease forwards",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #3B82F6, #10B981, transparent)",
              }}
            />
            <p
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: "#9CA3AF",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 18px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Open Session by Code
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontWeight: 500,
                    marginBottom: "7px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Session Code
                </label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && joinSessionByCode()}
                  placeholder="e.g. ABC123"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    fontSize: "13.5px",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.08em",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                onClick={joinSessionByCode}
                style={{
                  padding: "13px",
                  borderRadius: "10px",
                  background: "rgba(255,212,0,0.1)",
                  border: "1px solid rgba(255,212,0,0.22)",
                  color: "#FFD400",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Join / Open
              </button>
            </div>
          </div>
        </div>

        {/* SELECTED SESSION */}
        {activeSession && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "10px",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Selected Session
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "18px" }}>
                  {activeSession.title}
                </h3>
                <span
                  style={{
                    padding: "3px 9px",
                    borderRadius: "999px",
                    background: "rgba(255,212,0,0.1)",
                    border: "1px solid rgba(255,212,0,0.24)",
                    color: "#FFD400",
                    fontSize: "11px",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {activeSession.code}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveSession(null)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#9CA3AF",
                padding: "8px 14px",
                borderRadius: "9px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* SESSIONS */}
        <SectionCard
          title="All Sessions"
          badge={<CountBadge count={sessions.length} color="#FFD400" />}
          action={
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={sessionSearch}
                onChange={(e) => {
                  setSessionSearch(e.target.value);
                  setSessionPage(1);
                }}
                placeholder="Search sessions..."
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "5px 11px",
                  color: "#fff",
                  fontSize: "12px",
                  outline: "none",
                  width: "150px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
              <RefreshBtn onClick={refreshAll} loading={loadingSessions} />
            </div>
          }
          delay={40}
        >
          {loadingSessions ? (
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "12px",
                  }}
                >
                  <Shimmer w="55%" h="14px" />
                  <div style={{ marginTop: "10px" }} />
                  <Shimmer w="35%" h="11px" />
                  <div style={{ marginTop: "14px" }} />
                  <Shimmer w="24%" h="10px" />
                </div>
              ))}
            </div>
          ) : sessionsPageData.items.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>
                No sessions found.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "12px",
                  padding: "16px",
                }}
              >
                {sessionsPageData.items.map((s) => (
                  <SessionCard
                    key={s._id}
                    item={s}
                    onOpen={() => openSession(s)}
                  />
                ))}
              </div>

              {sessionsPageData.total > sessionPageSize && (
                <PaginationBar
                  page={sessionsPageData.safePage}
                  total={sessionsPageData.total}
                  pageSize={sessionPageSize}
                  onPage={setSessionPage}
                  onPageSize={(size) => {
                    setSessionPageSize(size);
                    setSessionPage(1);
                  }}
                />
              )}
            </>
          )}
        </SectionCard>

        {/* GLOBAL LEADERBOARD */}
        <SectionCard
          title="Global Leaderboard"
          badge={<CountBadge count={leaderboard.length} color="#00FF80" />}
          action={
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={leaderboardSearch}
                onChange={(e) => {
                  setLeaderboardSearch(e.target.value);
                  setLeaderboardPage(1);
                }}
                placeholder="Search..."
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "5px 11px",
                  color: "#fff",
                  fontSize: "12px",
                  outline: "none",
                  width: "150px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
              <RefreshBtn onClick={loadGlobalLeaderboard} loading={loadingLeaderboard} />
            </div>
          }
          delay={80}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
              <THead cols={["Rank", "Student", "Roll No", "Score"]} />
              <tbody>
                {loadingLeaderboard &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {[8, 38, 24, 28].map((w, j) => (
                        <td key={j} style={{ padding: "13px 18px" }}>
                          <Shimmer w={`${w}%`} h="12px" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!loadingLeaderboard &&
                  leaderboardPageData.items.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div
                          style={{
                            padding: "40px 24px",
                            textAlign: "center",
                            color: "#9CA3AF",
                            fontSize: "13px",
                          }}
                        >
                          No rankings yet
                        </div>
                      </td>
                    </tr>
                  )}

                {!loadingLeaderboard &&
                  leaderboardPageData.items.map((entry, idx) => {
                    const rank =
                      leaderboard.findIndex(
                        (x) => x.studentId === entry.studentId
                      ) + 1;

                    const medal =
                      rank === 1
                        ? {
                            bg: "rgba(255,212,0,0.08)",
                            text: "#FFD400",
                            border: "rgba(255,212,0,0.25)",
                          }
                        : rank === 2
                        ? {
                            bg: "rgba(192,192,200,0.07)",
                            text: "#C0C0C8",
                            border: "rgba(192,192,200,0.22)",
                          }
                        : rank === 3
                        ? {
                            bg: "rgba(205,124,58,0.07)",
                            text: "#CD7C3A",
                            border: "rgba(205,124,58,0.22)",
                          }
                        : null;

                    return (
                      <tr
                        key={entry.studentId}
                        className="row-hover"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: medal ? medal.bg : "transparent",
                        }}
                      >
                        <td style={{ padding: "12px 18px" }}>
                          {medal ? (
                            <div
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "7px",
                                background: medal.bg,
                                border: `1px solid ${medal.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                            </div>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                width: "26px",
                                height: "26px",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "7px",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "rgba(255,255,255,0.3)",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {rank}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <Avatar name={entry.name} size={28} />
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: medal ? 700 : 500,
                                color: medal ? medal.text : "rgba(255,255,255,0.85)",
                              }}
                            >
                              {entry.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#9CA3AF",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.07)",
                              padding: "2px 7px",
                              borderRadius: "5px",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {entry.rollNo}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <ScoreBar
                            score={entry.totalScore}
                            max={leaderboard[0]?.totalScore || 1}
                            color={medal?.text}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {leaderboardPageData.total > leaderboardPageSize && (
            <PaginationBar
              page={leaderboardPageData.safePage}
              total={leaderboardPageData.total}
              pageSize={leaderboardPageSize}
              onPage={setLeaderboardPage}
              onPageSize={(size) => {
                setLeaderboardPageSize(size);
                setLeaderboardPage(1);
              }}
            />
          )}
        </SectionCard>

        {/* GLOBAL STUDENTS */}
        <SectionCard
          title="All Students"
          badge={<CountBadge count={students.length} color="#10B981" />}
          action={
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setStudentPage(1);
                }}
                placeholder="Search..."
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "5px 11px",
                  color: "#fff",
                  fontSize: "12px",
                  outline: "none",
                  width: "150px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
              <RefreshBtn onClick={loadStudents} loading={loadingStudents} />
            </div>
          }
          delay={120}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <THead cols={["Name", "Roll No", "Email", "Joined"]} />
              <tbody>
                {loadingStudents &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {[40, 24, 55, 30].map((w, j) => (
                        <td key={j} style={{ padding: "13px 18px" }}>
                          <Shimmer w={`${w}%`} h="12px" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!loadingStudents && studentsPageData.items.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div
                        style={{
                          padding: "40px 24px",
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontSize: "13px",
                        }}
                      >
                        No students yet
                      </div>
                    </td>
                  </tr>
                )}

                {!loadingStudents &&
                  studentsPageData.items.map((s) => (
                    <tr
                      key={s._id}
                      className="row-hover"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <Avatar name={s.name || "?"} size={28} />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#FFFFFF",
                            }}
                          >
                            {s.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#9CA3AF",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {s.rollNo}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ fontSize: "12.5px", color: "#9CA3AF" }}>
                          {s.email}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span
                          style={{
                            fontSize: "11.5px",
                            color: "rgba(255,255,255,0.25)",
                          }}
                        >
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {studentsPageData.total > studentPageSize && (
            <PaginationBar
              page={studentsPageData.safePage}
              total={studentsPageData.total}
              pageSize={studentPageSize}
              onPage={setStudentPage}
              onPageSize={(size) => {
                setStudentPageSize(size);
                setStudentPage(1);
              }}
            />
          )}
        </SectionCard>

        {/* GLOBAL SUBMISSIONS */}
        <SectionCard
          title="All Submissions"
          badge={<CountBadge count={submissions.length} color="#3B82F6" />}
          action={
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={submissionSearch}
                onChange={(e) => {
                  setSubmissionSearch(e.target.value);
                  setSubmissionPage(1);
                }}
                placeholder="Search..."
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "5px 11px",
                  color: "#fff",
                  fontSize: "12px",
                  outline: "none",
                  width: "150px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
              <RefreshBtn onClick={() => loadGlobalSubmissions(sessions)} loading={loadingSubmissions} />
            </div>
          }
          delay={160}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
              <THead cols={["Session", "Student", "File", "Task", "Score", "Status", "Time"]} />
              <tbody>
                {loadingSubmissions &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {[18, 30, 26, 26, 12, 18, 18].map((w, j) => (
                        <td key={j} style={{ padding: "13px 18px" }}>
                          <Shimmer w={`${w}%`} h="12px" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!loadingSubmissions && submissionsPageData.items.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div
                        style={{
                          padding: "40px 24px",
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontSize: "13px",
                        }}
                      >
                        No submissions yet
                      </div>
                    </td>
                  </tr>
                )}

                {!loadingSubmissions &&
                  submissionsPageData.items.map((s, i) => {
                    const d = new Date(s.createdAt);
                    const dateStr = d.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    });
                    const timeStr = d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const taskTitle =
                      typeof s.taskId === "object" && s.taskId
                        ? s.taskId.title
                        : "—";

                    return (
                      <tr
                        key={s._id}
                        className="row-hover"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <td style={{ padding: "12px 18px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#9CA3AF",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.07)",
                              padding: "2px 7px",
                              borderRadius: "5px",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {s.session?.title || s.session?.code || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Avatar name={s.student?.name || "?"} size={26} />
                            <div>
                              <p
                                style={{
                                  fontSize: "12.5px",
                                  fontWeight: 600,
                                  color: "#FFFFFF",
                                  margin: 0,
                                }}
                              >
                                {s.student?.name || "—"}
                              </p>
                              <p
                                style={{
                                  fontSize: "10px",
                                  color: "#9CA3AF",
                                  margin: 0,
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                {s.student?.rollNo || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#9CA3AF",
                              fontFamily: "'JetBrains Mono', monospace",
                              maxWidth: "130px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {s.fileName}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.6)",
                              maxWidth: "140px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {taskTitle}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          {s.score !== null && s.score !== undefined ? (
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 800,
                                color:
                                  s.score >= 80
                                    ? "#10B981"
                                    : s.score >= 50
                                    ? "#F59E0B"
                                    : "#FF4D5E",
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              {s.score}
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: "rgba(255,255,255,0.2)",
                                  marginLeft: "2px",
                                }}
                              >
                                pts
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <StatusBadge status={s.status} />
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <p
                            style={{
                              fontSize: "11.5px",
                              color: "rgba(255,255,255,0.5)",
                              margin: 0,
                            }}
                          >
                            {dateStr}
                          </p>
                          <p
                            style={{
                              fontSize: "10px",
                              color: "rgba(255,255,255,0.2)",
                              margin: "1px 0 0",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {timeStr}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {submissionsPageData.total > submissionPageSize && (
            <PaginationBar
              page={submissionsPageData.safePage}
              total={submissionsPageData.total}
              pageSize={submissionPageSize}
              onPage={setSubmissionPage}
              onPageSize={(size) => {
                setSubmissionPageSize(size);
                setSubmissionPage(1);
              }}
            />
          )}
        </SectionCard>

        {/* GLOBAL ACTIVITY */}
        <SectionCard
          title="Activity Feed"
          badge={<CountBadge count={activities.length} color="#8B5CF6" />}
          action={
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={activitySearch}
                onChange={(e) => {
                  setActivitySearch(e.target.value);
                  setActivityPage(1);
                }}
                placeholder="Search..."
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "5px 11px",
                  color: "#fff",
                  fontSize: "12px",
                  outline: "none",
                  width: "150px",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
              <RefreshBtn onClick={() => loadGlobalActivities(sessions)} loading={loadingActivities} />
            </div>
          }
          delay={200}
        >
          {loadingActivities ? (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} h="36px" />
              ))}
            </div>
          ) : activitiesPageData.items.length === 0 ? (
            <div
              style={{
                padding: "36px 24px",
                textAlign: "center",
                color: "#9CA3AF",
                fontSize: "13px",
              }}
            >
              No activity yet
            </div>
          ) : (
            <>
              {activitiesPageData.items.map((a) => (
                <div
                  key={a._id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "13px 18px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s ease",
                  }}
                  className="row-hover"
                >
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#B30017",
                      boxShadow: "0 0 6px rgba(179,0,23,0.6)",
                      marginTop: "5px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.title}
                    </p>
                    <p
                      style={{
                        fontSize: "11.5px",
                        color: "#9CA3AF",
                        margin: "3px 0 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.description}
                      {a.session?.title ? ` · ${a.session.title}` : ""}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.2)",
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {new Date(a.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}

              {activitiesPageData.total > activityPageSize && (
                <PaginationBar
                  page={activitiesPageData.safePage}
                  total={activitiesPageData.total}
                  pageSize={activityPageSize}
                  onPage={setActivityPage}
                  onPageSize={(size) => {
                    setActivityPageSize(size);
                    setActivityPage(1);
                  }}
                />
              )}
            </>
          )}
        </SectionCard>

        {/* FOOTER NOTE */}
        <div
          style={{
            marginTop: "18px",
            padding: "16px 0 0",
            color: "rgba(255,255,255,0.18)",
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            textAlign: "center",
          }}
        >
          {topPerformer
            ? `Top performer: ${topPerformer.name} · ${topPerformer.totalScore} pts`
            : `Total evaluated score: ${totalScore}`}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGINATION BAR
══════════════════════════════════════════════════════════ */
function PaginationBar({
  page,
  total,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const visiblePages = Array.from(
    { length: Math.min(5, pages) },
    (_, i) => {
      const base = Math.max(1, Math.min(pages - 4, page - 2));
      return base + i;
    }
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px 20px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
        Showing {start}–{end} of {total} records
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          style={{
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            color: "#9CA3AF",
            padding: "6px 10px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {[10, 25, 50, 100].map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>

        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            color: page === 1 ? "#444" : "#9CA3AF",
            padding: "6px 12px",
            cursor: page === 1 ? "not-allowed" : "pointer",
            fontSize: "12px",
          }}
        >
          Prev
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            style={{
              background: p === page ? "#B30017" : "transparent",
              border: `1px solid ${
                p === page ? "#B30017" : "rgba(255,255,255,0.08)"
              }`,
              borderRadius: "8px",
              color: p === page ? "#fff" : "#9CA3AF",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "12px",
              minWidth: "32px",
            }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            color: page === pages ? "#444" : "#9CA3AF",
            padding: "6px 12px",
            cursor: page === pages ? "not-allowed" : "pointer",
            fontSize: "12px",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}