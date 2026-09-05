// src/components/shared/CCTVScreen.jsx
//
// ─── BACKEND INTEGRATION GUIDE ──────────────────────────────────────────────
//
// 1. LIVE VIDEO STREAM (FastAPI → RTSP/HLS/WebSocket):
//    Pass `streamUrl` prop with the HLS playlist or WebSocket URL.
//    The component automatically renders a <video> element instead of the placeholder.
//    Example: <CCTVScreen camera={cam} streamUrl="http://api/stream/cam001.m3u8" />
//
// 2. REAL-TIME AI DETECTIONS (FastAPI WebSocket / SSE):
//    Pass `detections` as an array from your WebSocket listener.
//    Falls back to `camera.detectionBoxes` (mock data) when `detections` is null.
//    Expected detection format per box:
//      { type: 'person' | 'vehicle', x, y, w, h (all 0–100%), confidence: 0–100 }
//    Example:
//      const [detections, setDetections] = useState(null)
//      useEffect(() => {
//        const ws = new WebSocket(`ws://api/detections/${camera.id}`)
//        ws.onmessage = e => setDetections(JSON.parse(e.data).boxes)
//        return () => ws.close()
//      }, [camera.id])
//      <CCTVScreen camera={cam} detections={detections} />
//
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { CameraOff } from 'lucide-react'

/** Color per detection type and risk level */
function getBoxColor(type, riskLevel) {
  if (type === 'vehicle') return '#ffaa00'
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') return '#ff3b3b'
  return '#00e676'
}

/** Single AI detection bounding box */
function BoundingBox({ box, riskLevel }) {
  const color = getBoxColor(box.type, riskLevel)
  return (
    <div
      style={{
        position: 'absolute',
        left: `${box.x}%`, top: `${box.y}%`,
        width: `${box.w}%`, height: `${box.h}%`,
        border: `1.5px solid ${color}`,
        zIndex: 3, pointerEvents: 'none',
      }}
    >
      {/* Corner anchors */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: 5, height: 5, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', top: -1, right: -1, width: 5, height: 5, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 5, height: 5, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 5, height: 5, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      {/* Class label */}
      <div
        style={{
          position: 'absolute', top: -14, left: -1,
          background: color,
          color: box.type === 'vehicle' ? '#000' : '#fff',
          fontSize: 7, fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          padding: '1px 4px', whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}
      >
        {box.type.toUpperCase()} {box.confidence}%
      </div>
    </div>
  )
}

/** Offline placeholder shown when camera has no signal */
function OfflineScreen({ camera }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#040810' }}>
      {/* Static noise pattern */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px),' +
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
          backgroundSize: '3px 3px',
        }}
      />
      {/* Content */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <CameraOff size={24} color="#2d3748" strokeWidth={1.5} />
        <div style={{ fontSize: 9, color: '#4a5568', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
          Signal Lost
        </div>
        <div style={{ fontSize: 8, color: '#374151', fontFamily: 'var(--font-mono)' }}>
          Last seen: {camera.lastSeen ?? '--:--:--'}
        </div>
      </div>
      {/* Camera label */}
      <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 3, fontSize: 8, color: '#374151', fontFamily: 'var(--font-mono)' }}>
        {camera.id} — {camera.location}
      </div>
    </div>
  )
}

/**
 * CCTVScreen
 *
 * Props:
 *   camera      — camera data object (required)
 *   streamUrl   — live HLS/WebSocket URL; if provided, renders <video> instead of placeholder
 *   detections  — real-time bounding boxes from AI model; falls back to camera.detectionBoxes
 */
function CCTVScreen({ camera, streamUrl = null, detections = null }) {
  const [liveTime, setLiveTime] = useState(new Date())
  const isOnline = camera.status === 'online'
  const isCritical = camera.riskLevel === 'CRITICAL'

  // Active detections: prefer live prop, fallback to mock
  const activeDetections = detections ?? camera.detectionBoxes ?? []

  // Tick the on-screen timestamp every second
  useEffect(() => {
    if (!isOnline) return
    const timer = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [isOnline])

  if (!isOnline) return <OfflineScreen camera={camera} />

  // ── Real video stream ─────────────────────────────────────────────
  if (streamUrl) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
        <video
          src={streamUrl}
          autoPlay muted playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Overlay detections on real stream */}
        {activeDetections.map((box, i) => (
          <BoundingBox key={i} box={box} riskLevel={camera.riskLevel} />
        ))}
      </div>
    )
  }

  // ── Mock CCTV placeholder (online) ───────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#040a10', overflow: 'hidden' }}>
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)',
        }}
      />
      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.018) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(0,212,255,0.018) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(0,20,50,0.25) 0%, rgba(0,4,12,0.75) 100%)',
        }}
      />

      {/* AI detection bounding boxes */}
      {activeDetections.map((box, i) => (
        <BoundingBox key={i} box={box} riskLevel={camera.riskLevel} />
      ))}

      {/* INTRUSION ALERT overlay (CRITICAL cameras) */}
      {isCritical && (
        <div
          className="alert-blink"
          style={{
            position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(200,0,0,0.9)', color: '#fff',
            fontSize: 8, fontWeight: 800, letterSpacing: '0.14em',
            padding: '2px 8px', borderRadius: 2, zIndex: 5, whiteSpace: 'nowrap',
          }}
        >
          ⚠ INTRUSION ALERT
        </div>
      )}

      {/* Top HUD bar: LIVE — REC — timestamp */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 4,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '5px 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(210,0,0,0.88)', padding: '1px 5px', borderRadius: 2, fontSize: 8, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse-dot 1s infinite' }} />
          LIVE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ff3b3b' }} />
          REC
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}>
          {liveTime.toLocaleTimeString('en-IN', { hour12: false })}
        </div>
      </div>

      {/* Corner bracket decorations */}
      <div style={{ position: 'absolute', top: 8, left: 8, width: 10, height: 10, borderTop: '1.5px solid rgba(0,212,255,0.45)', borderLeft: '1.5px solid rgba(0,212,255,0.45)', zIndex: 4 }} />
      <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderTop: '1.5px solid rgba(0,212,255,0.45)', borderRight: '1.5px solid rgba(0,212,255,0.45)', zIndex: 4 }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, width: 10, height: 10, borderBottom: '1.5px solid rgba(0,212,255,0.45)', borderLeft: '1.5px solid rgba(0,212,255,0.45)', zIndex: 4 }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8, width: 10, height: 10, borderBottom: '1.5px solid rgba(0,212,255,0.45)', borderRight: '1.5px solid rgba(0,212,255,0.45)', zIndex: 4 }} />

      {/* Bottom info overlay */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
          padding: '22px 8px 6px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{camera.id}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{camera.location}</div>
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>
          {camera.resolution} · {camera.fps}fps
        </div>
      </div>
    </div>
  )
}

export default CCTVScreen
