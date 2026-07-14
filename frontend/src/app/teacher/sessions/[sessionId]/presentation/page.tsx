"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { createPeerConnection } from "@/lib/webrtc";

const SESSION_CODE = "TEST123";

export default function PresentationPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sharing, setSharing] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "live" | "stopped">("idle");
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const connectedStudents = useRef<string[]>([]);

  useEffect(() => {
    socket.connect();
    socket.emit("teacher_join", SESSION_CODE);

    socket.on("student_connected", async ({ socketId }: { socketId: string }) => {
      connectedStudents.current = connectedStudents.current.filter((id) => id !== socketId);
      connectedStudents.current.push(socketId);
      setStudentCount(connectedStudents.current.length);
      if (streamRef.current) {
        await connectStudent(socketId, streamRef.current);
      }
    });

socket.on("answer", async ({ answer, from }) => {
  const peer =
    peerConnections.current.get(from);

  if (!peer) return;

  if (
    peer.signalingState !==
    "have-local-offer"
  ) {
    return;
  }

  try {
    await peer.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  } catch (err) {
    console.error(
      "RemoteDescription Error:",
      err
    );
  }
});

    socket.on("ice-candidate", async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
      const peer = peerConnections.current.get(from);
      if (!peer) return;
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("ICE Error:", error);
      }
    });

    return () => {
      socket.off("student_connected");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);

  const connectStudent = async (socketId: string, mediaStream: MediaStream) => {
const existingPeer =
  peerConnections.current.get(
    socketId
  );

if (existingPeer) {
  existingPeer.close();

  peerConnections.current.delete(
    socketId
  );
}

const peer =
  createPeerConnection();

peerConnections.current.set(
  socketId,
  peer
);

    peer.onconnectionstatechange = () => {
      console.log("Teacher State:", peer.connectionState);
    };

    mediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, mediaStream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, targetSocketId: socketId });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("offer", { offer, targetSocketId: socketId });
  };

  const startPresentation = async () => {
    try {
      setConnectionState("connecting");
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setSharing(true);
      setConnectionState("live");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      socket.emit("start_screen_share", SESSION_CODE);

      for (const studentId of connectedStudents.current) {
        await connectStudent(studentId, mediaStream);
      }

      mediaStream.getVideoTracks()[0].onended = () => {
        stopPresentation();
      };
    } catch (error) {
      console.error(error);
      setConnectionState("idle");
    }
  };

  const stopPresentation = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    socket.emit("stop_screen_share", SESSION_CODE);
    peerConnections.current.forEach((peer) => peer.close());
    peerConnections.current.clear();
    setSharing(false);
    setStream(null);
    setConnectionState("stopped");
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "32px",
            animation: "fadeUp 0.4s ease forwards",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
              Live Broadcast
            </p>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Presentation
            </h1>
          </div>

          {/* Status badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "20px",
                background: sharing ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${sharing ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: sharing ? "#10B981" : "#9CA3AF",
                  boxShadow: sharing ? "0 0 8px #10B981" : "none",
                  animation: sharing ? "pulse-live 2s infinite" : "none",
                  transition: "all 0.3s ease",
                }}
              />
              <span style={{ fontSize: "11px", fontWeight: 600, color: sharing ? "#10B981" : "#9CA3AF", letterSpacing: "0.06em" }}>
                {sharing ? "LIVE" : connectionState === "connecting" ? "STARTING" : "OFFLINE"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.04em" }}>
                {studentCount} watching
              </span>
            </div>
          </div>
        </div>

        {/* Video Stage */}
        <div
          style={{
            background: "#0D0D0D",
            border: `1px solid ${sharing ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: "20px",
            overflow: "hidden",
            position: "relative",
            marginBottom: "20px",
            transition: "border-color 0.3s ease",
            animation: "fadeUp 0.45s ease 0.1s forwards",
            opacity: 0,
            boxShadow: sharing ? "0 0 40px rgba(16,185,129,0.08)" : "none",
          }}
        >
          {/* Live badge overlay */}
          {sharing && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "20px",
                background: "rgba(179,0,23,0.85)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(179,0,23,0.5)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  animation: "pulse-live 1.2s infinite",
                }}
              />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.1em" }}>
                REC
              </span>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              aspectRatio: "16/9",
              display: "block",
              background: "#000000",
              objectFit: "contain",
            }}
          />

          {/* Idle overlay */}
          {!sharing && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  {connectionState === "stopped" ? "Presentation ended" : "No active presentation"}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: "4px 0 0" }}>
                  {connectionState === "stopped" ? "Start a new session to go live again" : "Click Start Presentation to share your screen"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            animation: "fadeUp 0.45s ease 0.18s forwards",
            opacity: 0,
          }}
        >
          <button
            onClick={startPresentation}
            disabled={sharing || connectionState === "connecting"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "13px 28px",
              borderRadius: "12px",
              background:
                sharing || connectionState === "connecting"
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, #B30017 0%, #8B0012 100%)",
              border: `1px solid ${sharing || connectionState === "connecting" ? "rgba(255,255,255,0.08)" : "transparent"}`,
              color: sharing || connectionState === "connecting" ? "#9CA3AF" : "#FFFFFF",
              cursor: sharing || connectionState === "connecting" ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.2s ease",
              boxShadow:
                sharing || connectionState === "connecting"
                  ? "none"
                  : "0 0 24px rgba(179,0,23,0.35)",
            }}
            onMouseEnter={(e) => {
              if (!sharing && connectionState !== "connecting")
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(179,0,23,0.55)";
            }}
            onMouseLeave={(e) => {
              if (!sharing && connectionState !== "connecting")
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(179,0,23,0.35)";
            }}
          >
            {connectionState === "connecting" ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Presentation
              </>
            )}
          </button>

          <button
            onClick={stopPresentation}
            disabled={!sharing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "13px 28px",
              borderRadius: "12px",
              background: sharing ? "rgba(179,0,23,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${sharing ? "rgba(179,0,23,0.35)" : "rgba(255,255,255,0.07)"}`,
              color: sharing ? "#FF4D5E" : "#9CA3AF",
              cursor: sharing ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (sharing) {
                (e.currentTarget as HTMLElement).style.background = "rgba(179,0,23,0.2)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(179,0,23,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (sharing) {
                (e.currentTarget as HTMLElement).style.background = "rgba(179,0,23,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(179,0,23,0.35)";
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            Stop Presentation
          </button>
        </div>

        {/* Info strip */}
        <div
          style={{
            marginTop: "20px",
            padding: "14px 20px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeUp 0.45s ease 0.24s forwards",
            opacity: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: "12.5px", color: "#9CA3AF", margin: 0, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.5 }}>
            Session code{" "}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#FFD400",
                background: "rgba(255,212,0,0.08)",
                padding: "1px 7px",
                borderRadius: "5px",
                border: "1px solid rgba(255,212,0,0.15)",
                fontSize: "11px",
              }}
            >
              {SESSION_CODE}
            </span>
            {" "}· Screen is shared at 15fps · Audio is disabled · Students connect automatically
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}