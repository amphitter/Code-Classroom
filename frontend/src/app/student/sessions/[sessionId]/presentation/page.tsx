"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { createPeerConnection } from "@/lib/webrtc";

const SESSION_CODE = "TEST123";

type StreamState = "waiting" | "connecting" | "live" | "ended";

export default function StudentPresentationPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [streamState, setStreamState] = useState<StreamState>("waiting");
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.connect();
    socket.emit("student_join", SESSION_CODE);

    socket.on("screen_share_started", () => {
      setStreamState("connecting");
    });

    socket.on("screen_share_stopped", () => {
      setStreamState("ended");
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    });

    socket.on("offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      setStreamState("connecting");
      peerRef.current?.close();

const peer =
  createPeerConnection();

peerRef.current =
  peer;

      peer.ontrack = (event) => {
        if (!videoRef.current) return;
        if (videoRef.current.srcObject) return;
        const stream = event.streams[0];
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .then(() => setStreamState("live"))
          .catch(console.error);
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, targetSocketId: from });
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "disconnected" || peer.connectionState === "failed") {
          setStreamState("ended");
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("answer", { answer, targetSocketId: from });
    });

    socket.on("ice-candidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (!peerRef.current) return;
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("ICE Error:", error);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("screen_share_started");
      socket.off("screen_share_stopped");
      peerRef.current?.close();
    };
  }, []);

  const forcePlay = () => {
    videoRef.current?.play().catch(console.error);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const stateConfig = {
    waiting: {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      title: "Waiting for Teacher",
      sub: "The presentation will appear here once your teacher starts sharing their screen.",
      color: "rgba(255,255,255,0.15)",
    },
    connecting: {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      ),
      title: "Connecting...",
      sub: "Establishing peer connection with your teacher.",
      color: "#3B82F6",
    },
    ended: {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
      ),
      title: "Presentation Ended",
      sub: "Your teacher has stopped the presentation. Wait for them to start again.",
      color: "#F59E0B",
    },
    live: { icon: null, title: "", sub: "", color: "#10B981" },
  };

  const cfg = stateConfig[streamState];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.12) !important; color: #FFFFFF !important; }
        .ctrl-btn { transition: all 0.18s ease !important; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "28px",
            animation: "fadeUp 0.4s ease forwards",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 500 }}>
              Student
            </p>
            <h1 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Live Presentation
            </h1>
          </div>

          {/* Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 16px",
              borderRadius: "20px",
              background:
                streamState === "live"
                  ? "rgba(16,185,129,0.1)"
                  : streamState === "connecting"
                  ? "rgba(59,130,246,0.1)"
                  : streamState === "ended"
                  ? "rgba(245,158,11,0.1)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                streamState === "live"
                  ? "rgba(16,185,129,0.3)"
                  : streamState === "connecting"
                  ? "rgba(59,130,246,0.3)"
                  : streamState === "ended"
                  ? "rgba(245,158,11,0.3)"
                  : "rgba(255,255,255,0.08)"
              }`,
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: cfg.color,
                boxShadow: streamState !== "waiting" ? `0 0 8px ${cfg.color}` : "none",
                animation: streamState === "live" || streamState === "connecting" ? "pulse-dot 1.8s infinite" : "none",
              }}
            />
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: cfg.color,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {streamState === "waiting" ? "Standby" : streamState === "connecting" ? "Connecting" : streamState === "live" ? "Live" : "Ended"}
            </span>
          </div>
        </div>

        {/* Video Stage */}
        <div
          ref={containerRef}
          style={{
            background: "#080808",
            border: `1px solid ${streamState === "live" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: "20px",
            overflow: "hidden",
            position: "relative",
            marginBottom: "16px",
            animation: "fadeUp 0.45s ease 0.1s forwards",
            opacity: 0,
            transition: "border-color 0.3s ease",
            boxShadow: streamState === "live" ? "0 0 40px rgba(16,185,129,0.07)" : "none",
          }}
        >
          {/* Live badge */}
          {streamState === "live" && (
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
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
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFFFFF", animation: "pulse-dot 1.2s infinite" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.12em" }}>LIVE</span>
            </div>
          )}

          {/* Session badge */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "20px",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
              {SESSION_CODE}
            </span>
          </div>

          <video
            ref={videoRef}
            autoPlay
            muted={muted}
            playsInline
            controls={false}
            style={{
              width: "100%",
              aspectRatio: "16/9",
              display: "block",
              background: "#000000",
              objectFit: "contain",
            }}
          />

          {/* Overlay when not live */}
          {streamState !== "live" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${cfg.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: cfg.color,
                  animation: streamState === "connecting" ? "spin 2s linear infinite" : "none",
                }}
              >
                {cfg.icon}
              </div>
              <div style={{ textAlign: "center", maxWidth: "320px" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 6px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {cfg.title}
                </p>
                <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {cfg.sub}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            animation: "fadeUp 0.45s ease 0.18s forwards",
            opacity: 0,
          }}
        >
          <button
            onClick={forcePlay}
            className="ctrl-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "#9CA3AF",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Force Play
          </button>

          <button
            onClick={toggleMute}
            className="ctrl-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: muted ? "rgba(179,0,23,0.1)" : "rgba(16,185,129,0.1)",
              border: `1px solid ${muted ? "rgba(179,0,23,0.25)" : "rgba(16,185,129,0.25)"}`,
              color: muted ? "#FF4D5E" : "#10B981",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.18s ease",
            }}
          >
            {muted ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                Unmute
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                Mute
              </>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="ctrl-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "#9CA3AF",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {fullscreen ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
                Exit Fullscreen
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
                Fullscreen
              </>
            )}
          </button>
        </div>

        {/* Info strip */}
        <div
          style={{
            marginTop: "16px",
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
            Session{" "}
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
            {" "}· Stream is receive-only · Audio disabled by default · Click Force Play if video stalls
          </p>
        </div>
      </div>
    </>
  );
}