"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  email: string;
  createdAt: string;
  batchYear?: string;
  studentNumber?: string;
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {[45, 30, 60, 40, 30].map((w, i) => (
        <td key={i} style={{ padding: "16px 20px" }}>
          <div
            className="shimmer"
            style={{ height: "12px", width: `${w}%`, borderRadius: "6px" }}
          />
        </td>
      ))}
    </tr>
  );
}

function Avatar({ name }: { name: string }) {
  const safeName = (name || "Student").trim();
  const initials = safeName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hue = safeName.charCodeAt(0) % 360;

  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: `hsl(${hue}, 40%, 22%)`,
        border: `1px solid hsl(${hue}, 40%, 32%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 700,
        color: `hsl(${hue}, 60%, 70%)`,
        fontFamily: "'Space Grotesk', sans-serif",
        flexShrink: 0,
      }}
    >
      {initials || "S"}
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "640px",
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          animation: "fadeUp 0.25s ease forwards",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10.5px",
                color: "#9CA3AF",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Student Management
            </p>
            <h2
              style={{
                fontSize: "22px",
                color: "#FFFFFF",
                margin: "6px 0 0",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#9CA3AF",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#9CA3AF",
              cursor: "pointer",
              flexShrink: 0,
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "22px" }}>{children}</div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
const params = useParams();

const SESSION_ID =
  params.sessionId as string;
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    batchYear: "",
    studentNumber: "",
    password: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/session/${SESSION_ID}/students`);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return students.filter((s) => {
      if (!q) return true;

      return (
        s.name?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openCreateModal = () => {
    setCreateForm({
      name: "",
      email: "",
      batchYear: "",
      studentNumber: "",
      password: "",
    });
    setCreateOpen(true);
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name || "",
      email: student.email || "",
    });
    setEditOpen(true);
  };

  const createStudent = async () => {
    try {
      if (
        !createForm.name.trim() ||
        !createForm.email.trim() ||
        !createForm.batchYear.trim() ||
        !createForm.studentNumber.trim() ||
        !createForm.password.trim()
      ) {
        alert("Please fill all fields");
        return;
      }

      setSubmitting(true);

      await api.post("/student/create", createForm);

      setCreateOpen(false);
      await loadStudents();
      alert("Student created successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStudent = async () => {
    try {
      if (!selectedStudent) return;

      if (!editForm.name.trim() || !editForm.email.trim()) {
        alert("Please fill required fields");
        return;
      }

      setSubmitting(true);

      await api.put(`/student/${selectedStudent._id}`, editForm);

      setEditOpen(false);
      setSelectedStudent(null);
      await loadStudents();
      alert("Student updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStudent = async (student: Student) => {
    const ok = window.confirm(
      `Delete student "${student.name}"? This action cannot be undone.`
    );

    if (!ok) return;

    try {
      await api.delete(`/student/${student._id}`);
      await loadStudents();
      alert("Student deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete student");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
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
        .student-row:hover td { background: rgba(255,255,255,0.02) !important; }
        ::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .action-btn {
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          transform: translateY(-1px);
        }
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
              Session
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
              Students
            </h1>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={openCreateModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                background: "rgba(179,0,23,0.12)",
                border: "1px solid rgba(179,0,23,0.22)",
                color: "#FFD400",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              className="action-btn"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(179,0,23,0.18)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(179,0,23,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(179,0,23,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(179,0,23,0.22)";
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
              Add Student
            </button>

            <button
              onClick={loadStudents}
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
              className="action-btn"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.16)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
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
        </div>

        {/* Stats + Search row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "20px",
            flexWrap: "wrap",
            animation: "fadeUp 0.45s ease 0.08s forwards",
            opacity: 0,
          }}
        >
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(179,0,23,0.12)",
                border: "1px solid rgba(179,0,23,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#B30017",
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#9CA3AF",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Enrolled
              </p>
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  margin: "2px 0 0",
                  lineHeight: 1,
                }}
              >
                {loading ? "—" : students.length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: searchFocused ? "#B30017" : "rgba(255,255,255,0.2)",
                transition: "color 0.2s ease",
                pointerEvents: "none",
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, roll no, or email..."
              style={{
                width: "100%",
                height: "100%",
                background: searchFocused
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  searchFocused
                    ? "rgba(179,0,23,0.45)"
                    : "rgba(255,255,255,0.08)"
                }`,
                borderRadius: "12px",
                padding: "0 16px 0 40px",
                color: "#FFFFFF",
                fontSize: "13.5px",
                fontFamily: "'Space Grotesk', sans-serif",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                boxShadow: searchFocused
                  ? "0 0 0 3px rgba(179,0,23,0.1)"
                  : "none",
                minHeight: "52px",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
            animation: "fadeUp 0.45s ease 0.15s forwards",
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
              Roster
            </p>
            {!loading && search && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {filtered.length} of {students.length} shown
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Name", "Roll No", "Email", "Joined", "Actions"].map((h) => (
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
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
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
                            color: "rgba(255,255,255,0.2)",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
                          {search
                            ? "No students match your search"
                            : "No students enrolled yet"}
                        </p>
                        {search && (
                          <button
                            onClick={() => setSearch("")}
                            style={{
                              background: "none",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "8px",
                              color: "#9CA3AF",
                              cursor: "pointer",
                              padding: "6px 14px",
                              fontSize: "12px",
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((student, i) => (
                    <tr
                      key={student._id}
                      className="student-row"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        cursor: "default",
                        animationDelay: `${i * 40}ms`,
                        animation: "fadeUp 0.4s ease forwards",
                        opacity: 0,
                      }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Avatar name={student.name || "?"} />
                          <span
                            style={{
                              fontSize: "13.5px",
                              fontWeight: 600,
                              color: "#FFFFFF",
                              fontFamily: "'Space Grotesk', sans-serif",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {student.name || "—"}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            fontFamily: "'JetBrains Mono', monospace",
                            background: "rgba(255,255,255,0.04)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.07)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.rollNo || "—"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#9CA3AF",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {student.email || "—"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.3)",
                            fontFamily: "'Space Grotesk', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.createdAt ? formatDate(student.createdAt) : "—"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => openEditModal(student)}
                            style={{
                              padding: "7px 12px",
                              borderRadius: "9px",
                              background: "rgba(255,212,0,0.08)",
                              border: "1px solid rgba(255,212,0,0.18)",
                              color: "#FFD400",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteStudent(student)}
                            style={{
                              padding: "7px 12px",
                              borderRadius: "9px",
                              background: "rgba(179,0,23,0.08)",
                              border: "1px solid rgba(179,0,23,0.18)",
                              color: "#B30017",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {createOpen && (
        <ModalShell
          title="Add Student"
          subtitle="Create a new student record for the bootcamp."
          onClose={() => setCreateOpen(false)}
        >
          <div style={{ display: "grid", gap: "14px" }}>
            {[
              { key: "name", label: "Name", placeholder: "Student name" },
              { key: "email", label: "Email", placeholder: "student@email.com" },
              { key: "batchYear", label: "Batch Year", placeholder: "2025" },
              { key: "studentNumber", label: "Student Number", placeholder: "001" },
              { key: "password", label: "Password", placeholder: "Create password", type: "password" },
            ].map((field) => (
              <label key={field.key} style={{ display: "grid", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {field.label}
                </span>
                <input
                  type={field.type || "text"}
                  value={(createForm as any)[field.key]}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    fontSize: "13.5px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </label>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                onClick={() => setCreateOpen(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={createStudent}
                disabled={submitting}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(179,0,23,0.22)",
                  background: "rgba(179,0,23,0.14)",
                  color: "#FFD400",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                {submitting ? "Creating..." : "Create Student"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {editOpen && selectedStudent && (
        <ModalShell
          title="Edit Student"
          subtitle={`Update profile for ${selectedStudent.name}.`}
          onClose={() => {
            setEditOpen(false);
            setSelectedStudent(null);
          }}
        >
          <div style={{ display: "grid", gap: "14px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Name
              </span>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Email
              </span>
              <input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                onClick={() => {
                  setEditOpen(false);
                  setSelectedStudent(null);
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={updateStudent}
                disabled={submitting}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,212,0,0.18)",
                  background: "rgba(255,212,0,0.08)",
                  color: "#FFD400",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}