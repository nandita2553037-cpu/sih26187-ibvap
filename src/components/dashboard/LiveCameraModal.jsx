// src/components/dashboard/LiveCameraModal.jsx
//
// ─── BACKEND INTEGRATION NOTE ──────────────────────────────────────────────
//
// API Endpoint: GET /api/cameras/:id
// This modal can fetch live metrics, RTSP stream URL, and telemetry from FastAPI.
//
// Example integration:
// useEffect(() => {
//   if (!camera?.id) return
//   fetch(`/api/cameras/${camera.id}`)
//     .then(res => res.json())
//     .then(data => setCameraDetails(data))
// }, [camera?.id])
//
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { X, Camera, MapPin, Activity, Users, Truck, AlertTriangle, ShieldAlert, Cpu, Radio, RefreshCw, CheckCircle2, Clock } from 'lucide-react'
import CCTVScreen from '../shared/CCTVScreen'
import RiskBadge from './RiskBadge'

function LiveCameraModal({ camera, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [streamType, setStreamType] = useState('AI Overlay Feed')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!camera) return null

  const isOnline = camera.status === 'online'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 14, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      {/* Modal Dialog Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,212,255,0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ───────────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: isOnline ? 'rgba(0,212,255,0.1)' : 'rgba(255,59,59,0.1)',
                border: `1px solid ${isOnline ? 'rgba(0,212,255,0.3)' : 'rgba(255,59,59,0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
              }}
            >
              <Camera size={20} color={isOnline ? '#00d4ff' : '#ff3b3b'} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {camera.id}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>—</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {camera.location}
                </span>
                <RiskBadge severity={camera.riskLevel} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2, fontSize: 11, color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color="var(--color-accent)" />
                  {camera.zone || 'Sector Alpha'}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
                  <span style={{ textTransform: 'uppercase', fontWeight: 600, color: isOnline ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {camera.status}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            id="close-camera-modal-btn"
            aria-label="Close modal"
            onClick={onClose}
            style={{
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              width: 32,
              height: 32,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'var(--color-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Main Body ────────────────────────────────────────── */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Main Grid: Left CCTV player (60%), Right Telemetry Panel (40%) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Left: Expanded CCTV Screen */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                <CCTVScreen camera={camera} />
              </div>

              {/* Video Feed Controls & Metadata */}
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  background: 'var(--color-bg-overlay)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: 11,
                }}
              >
                <div style={{ display: 'flex', gap: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>RES: <strong style={{ color: '#fff' }}>{camera.resolution || '1080p'}</strong></span>
                  <span>FPS: <strong style={{ color: '#fff' }}>{isOnline ? (camera.fps || 30) : 0}</strong></span>
                  <span>CODEC: <strong style={{ color: '#fff' }}>H.264 / RTSP</strong></span>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {['AI Overlay Feed', 'Raw CCTV'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setStreamType(mode)}
                      style={{
                        padding: '3px 8px',
                        fontSize: 10,
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: streamType === mode ? 'var(--color-accent)' : 'var(--color-border)',
                        background: streamType === mode ? 'rgba(0,212,255,0.15)' : 'transparent',
                        color: streamType === mode ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Telemetry & Detection Statistics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Detection Summary Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                
                {/* Persons Box */}
                <div
                  style={{
                    background: 'var(--color-bg-overlay)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Persons</span>
                    <Users size={16} color="#00d4ff" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
                    {isOnline ? (camera.persons || 0) : 0}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    AI Confidence avg 89%
                  </div>
                </div>

                {/* Vehicles Box */}
                <div
                  style={{
                    background: 'var(--color-bg-overlay)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Vehicles</span>
                    <Truck size={16} color="#ffaa00" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#ffaa00', fontFamily: 'var(--font-mono)' }}>
                    {isOnline ? (camera.vehicles || 0) : 0}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    License plate scan ready
                  </div>
                </div>

              </div>

              {/* Risk & Threat Analysis Box */}
              <div
                style={{
                  background: 'var(--color-bg-overlay)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Threat Score Analysis
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: camera.riskScore > 80 ? '#ff3b3b' : camera.riskScore > 50 ? '#ffaa00' : '#00e676',
                    }}
                  >
                    {camera.riskScore || 0} / 100
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: 6,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${camera.riskScore || 0}%`,
                      height: '100%',
                      background: camera.riskScore > 80 ? '#ff3b3b' : camera.riskScore > 50 ? '#ffaa00' : '#00e676',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {camera.riskLevel === 'CRITICAL' && '⚠️ Immediate intruder alert triggered. Sector security forces notified.'}
                  {camera.riskLevel === 'HIGH' && '⚡ High-risk activity flagged. Continuous perimeter tracking active.'}
                  {camera.riskLevel === 'MEDIUM' && '🔍 Moderate movement detected. AI model monitoring behavior.'}
                  {camera.riskLevel === 'LOW' && '✅ Sector normal. No unauthorized perimeter breaches detected.'}
                  {camera.riskLevel === 'OFFLINE' && '❌ Feed disconnected. Check network router or power line.'}
                </div>
              </div>

              {/* Last Event Box */}
              <div
                style={{
                  background: 'var(--color-bg-overlay)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  <Clock size={14} color="var(--color-accent)" />
                  <span>Last Detected Event</span>
                </div>

                {isOnline ? (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {camera.lastEvent || 'Routine patrol pass'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      Timestamp: {camera.lastEventTime || '10:51:48'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-danger)', fontWeight: 500 }}>
                      Camera feed offline — Signal Lost
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      Last seen active at {camera.lastSeen || '10:34:12'}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* FastAPI Endpoint Structure Indicator */}
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(0,212,255,0.04)',
              border: '1px dashed rgba(0,212,255,0.2)',
              borderRadius: 8,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={14} color="var(--color-accent)" />
              <span>
                Backend API Binding Ready: <code style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>GET /api/cameras/{camera.id}</code>
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              WebSocket: ws://localhost:8000/ws/live/{camera.id}
            </span>
          </div>

        </div>

        {/* ── Modal Footer ───────────────────────────────────────────── */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-overlay)',
            display: 'flex',
            justify: 'flex-end',
            gap: 10,
          }}
        >
          <button
            id="modal-close-bottom-btn"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}

export default LiveCameraModal
