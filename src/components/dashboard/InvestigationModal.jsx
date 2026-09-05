// src/components/dashboard/InvestigationModal.jsx
import { useEffect, useState } from 'react'
import {
  X,
  FileSearch,
  Camera,
  MapPin,
  Clock,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  User,
  Activity,
  Download,
  Share2,
  Radio,
  Eye,
  Layers,
  Cpu,
} from 'lucide-react'

import RiskBadge from './RiskBadge'
import CCTVScreen from '../shared/CCTVScreen'
import { allCamerasData } from '../../data/mockData'

function getRiskColor(score) {
  if (score >= 81) return '#ff3b3b'
  if (score >= 61) return '#ff7043'
  if (score >= 31) return '#ffaa00'
  return '#00e676'
}

function InvestigationModal({ incident, onClose, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(incident?.status || 'UNDER INVESTIGATION')
  const [downloading, setDownloading] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!incident) return null

  const riskColor = getRiskColor(incident.riskScore)

  // Find camera data matching incident.cameraId
  const matchingCam = allCamerasData.find((c) => c.id === incident.cameraId) || {
    id: incident.cameraId,
    location: incident.location,
    status: 'online',
    riskLevel: incident.severity,
    resolution: '1080p',
    fps: 30,
    detectionBoxes: [
      { type: 'person', x: 28, y: 14, w: 11, h: 33, confidence: 96 },
      { type: 'person', x: 47, y: 11, w: 10, h: 35, confidence: 94 },
    ],
  }

  const handleStatusUpdate = (newStatus) => {
    setCurrentStatus(newStatus)
    if (onStatusChange) {
      onStatusChange(incident.id, newStatus)
    }
  }

  const handleExportReport = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      alert(`Forensic Dossier Report for ${incident.id} exported successfully.`)
    }, 1000)
  }

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
          maxWidth: 980,
          maxHeight: '92vh',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(0,212,255,0.08)',
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
                background: 'rgba(0,212,255,0.12)',
                border: '1px solid rgba(0,212,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
              }}
            >
              <FileSearch size={20} color="var(--color-accent)" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {incident.id}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {incident.event}
                </span>
                <RiskBadge severity={incident.severity} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2, fontSize: 11, color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Camera size={11} color="var(--color-accent)" />
                  <strong style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{incident.cameraId}</strong>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color="var(--color-accent)" />
                  {incident.location} ({incident.zone || 'Sector Alpha'})
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={11} />
                  {incident.date} at {incident.time}
                </span>
              </div>
            </div>
          </div>

          <button
            id="close-investigation-modal-btn"
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Left Column: CCTV Freeze-frame Evidence Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={14} color="var(--color-accent)" />
                <span>Forensic CCTV Evidence Frame</span>
              </div>

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
                <CCTVScreen camera={matchingCam} />
              </div>

              {/* Evidence Frame Metadata */}
              <div
                style={{
                  padding: '10px 12px',
                  background: 'var(--color-bg-overlay)',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: 11,
                  display: 'flex',
                  justify: 'space-between',
                  color: 'var(--color-text-muted)',
                }}
              >
                <div>
                  AI Model Confidence: <strong style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>{incident.modelConfidence || '96.8%'}</strong>
                </div>
                <div>
                  FPS: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{matchingCam.fps || 30}</strong>
                </div>
                <div>
                  Codec: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>H.265 / RTSP</strong>
                </div>
              </div>

              {/* Detected Entities Tags */}
              <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  AI Model Object Classifications
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(incident.detectedObjects || ['Person Detection', 'Thermal Trace']).map((obj, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.25)',
                        color: 'var(--color-accent)',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Telemetry, Case Info & Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Threat Score Assessment */}
              <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Incident Threat Assessment
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: riskColor }}>
                    {incident.riskScore} / 100
                  </span>
                </div>

                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${incident.riskScore}%`, height: '100%', background: riskColor }} />
                </div>

                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {incident.summary || 'Tactical video analytics engine logged perimeter border alert event.'}
                </p>
              </div>

              {/* Lead Investigator & Case Officer Box */}
              <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Assigned Lead Investigator
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={13} color="var(--color-accent)" />
                    <span>{incident.investigator || 'Command Center Duty Officer'}</span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>STATUS</div>
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    style={{
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border)',
                      color:
                        currentStatus === 'UNDER INVESTIGATION'
                          ? 'var(--color-accent)'
                          : currentStatus === 'RESOLVED'
                          ? '#00e676'
                          : '#ffaa00',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 4,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="UNDER INVESTIGATION">UNDER INVESTIGATION</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="UNACKNOWLEDGED">UNACKNOWLEDGED</option>
                  </select>
                </div>
              </div>

              {/* ── Chronological Incident Timeline Log ───────────────────── */}
              <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '12px 14px', flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Activity size={13} color="var(--color-accent)" />
                  <span>Chronological Audit Activity Log</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(incident.timeline || [
                    { time: incident.time, note: 'AI detection model triggered perimeter event.', actor: 'AI Analytics Engine' },
                    { time: '10:53:00', note: 'Case assigned for officer review.', actor: 'System Auto-Assign' },
                  ]).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', marginTop: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          {item.note}
                        </div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                          <span>{item.time}</span>
                          <span>•</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{item.actor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* FastAPI Binding Notification Banner */}
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
                Forensic Case API Endpoint: <code style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>GET /api/investigations/{incident.id}</code>
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Hash: SHA-256 Verified
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
            justify: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Case ID: {incident.id} • Forensic Audit Active
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Export Report Button */}
            <button
              id="btn-export-investigation-report"
              onClick={handleExportReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 6,
                background: 'rgba(0,212,255,0.12)',
                border: '1px solid rgba(0,212,255,0.3)',
                color: 'var(--color-accent)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.12)')}
            >
              <Download size={14} className={downloading ? 'animate-spin' : ''} />
              <span>Export Incident Dossier</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-close-investigation-modal"
              onClick={onClose}
              style={{
                padding: '8px 16px',
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
    </div>
  )
}

export default InvestigationModal
