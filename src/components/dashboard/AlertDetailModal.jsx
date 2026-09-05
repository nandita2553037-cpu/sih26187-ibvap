// src/components/dashboard/AlertDetailModal.jsx
import { useEffect } from 'react'
import {
  X,
  AlertTriangle,
  MapPin,
  Clock,
  Camera,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Layers,
  Radio,
  Eye,
  Activity,
  UserCheck,
  ShieldAlert,
} from 'lucide-react'
import RiskBadge from './RiskBadge'
import CCTVScreen from '../shared/CCTVScreen'
import { allCamerasData } from '../../data/mockData'

const STATUS_CONFIG = {
  UNACKNOWLEDGED: { color: '#ff3b3b', bg: 'rgba(255,59,59,0.1)', border: 'rgba(255,59,59,0.3)', label: 'UNACKNOWLEDGED' },
  ACKNOWLEDGED: { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.3)', label: 'ACKNOWLEDGED' },
  RESOLVED: { color: '#00e676', bg: 'rgba(0,230,118,0.1)', border: 'rgba(0,230,118,0.3)', label: 'RESOLVED' },
}

function getRiskColor(score) {
  if (score >= 81) return '#ff3b3b'
  if (score >= 61) return '#ff7043'
  if (score >= 31) return '#ffaa00'
  return '#00e676'
}

function AlertDetailModal({ alert, onClose, onAcknowledge, onResolve }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!alert) return null

  const statusStyle = STATUS_CONFIG[alert.status] || STATUS_CONFIG.ACKNOWLEDGED
  const riskColor = getRiskColor(alert.riskScore)

  // Find camera data matching alert.cameraId
  const matchingCam = allCamerasData.find((c) => c.id === alert.cameraId) || {
    id: alert.cameraId,
    location: alert.location,
    status: 'online',
    riskLevel: alert.severity,
    resolution: '1080p',
    fps: 30,
    detectionBoxes: alert.detectionBoxes || [],
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
      {/* Modal Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255,59,59,0.08)',
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
                background: alert.severity === 'CRITICAL' ? 'rgba(255,59,59,0.14)' : 'rgba(255,170,0,0.14)',
                border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(255,59,59,0.4)' : 'rgba(255,170,0,0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
              }}
            >
              <AlertTriangle size={20} color={alert.severity === 'CRITICAL' ? '#ff3b3b' : '#ffaa00'} />
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
                  {alert.id}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>—</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {alert.event}
                </span>
                <RiskBadge severity={alert.severity} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2, fontSize: 11, color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Camera size={11} color="var(--color-accent)" />
                  <strong style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{alert.cameraId}</strong>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color="var(--color-accent)" />
                  {alert.location} ({alert.zone || 'Sector Alpha'})
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} color="var(--color-text-muted)" />
                  {alert.time}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            id="close-alert-modal-btn"
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

        {/* ── Modal Main Content ─────────────────────────────────────── */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Left: Snapshot Feed Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={14} color="var(--color-accent)" />
                <span>Detection Freeze Frame (Camera {alert.cameraId})</span>
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(255,59,59,0.5)' : 'var(--color-border)'}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                <CCTVScreen camera={matchingCam} />
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--color-bg-overlay)',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  fontSize: 11,
                  display: 'flex',
                  justify: 'space-between',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>AI Frame ID: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>#FRM-99420</strong></span>
                <span>Model Confidence: <strong style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>{alert.modelConfidence || '95.2%'}</strong></span>
              </div>
            </div>

            {/* Right: Alert Telemetry & Risk Meter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Alert Status Banner */}
              <div
                style={{
                  background: statusStyle.bg,
                  border: `1px solid ${statusStyle.border}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Current Status
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: statusStyle.color, letterSpacing: '0.04em', marginTop: 2 }}>
                    {alert.status}
                  </div>
                </div>

                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: statusStyle.bg,
                    border: `1px solid ${statusStyle.border}`,
                    color: statusStyle.color,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {alert.status}
                </span>
              </div>

              {/* Threat Score Progress Box */}
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
                    Risk Threat Assessment
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: riskColor }}>
                    {alert.riskScore} / 100
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: 8,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: `${alert.riskScore}%`,
                      height: '100%',
                      background: riskColor,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {alert.details || 'Intelligent Video Analytics engine triggered real-time perimeter alert.'}
                </div>
              </div>

              {/* Detected Objects List */}
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
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  AI Detected Entities
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(alert.detectedObjects || ['Human Detection', 'Perimeter Tripwire Breach']).map((obj, i) => (
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
          </div>

          {/* Fast API Endpoint Marker */}
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255,170,0,0.04)',
              border: '1px dashed rgba(255,170,0,0.25)',
              borderRadius: 8,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={14} color="#ffaa00" />
              <span>
                FastAPI Action Endpoint: <code style={{ color: '#ffaa00', fontFamily: 'var(--font-mono)' }}>POST /api/alerts/{alert.id}/ack</code>
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Audit log recorded
            </span>
          </div>

        </div>

        {/* ── Modal Footer with Action Buttons ────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Alert ID: {alert.id} • {alert.time}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Acknowledge Button */}
            {alert.status === 'UNACKNOWLEDGED' && (
              <button
                id="btn-acknowledge-alert"
                onClick={() => {
                  onAcknowledge && onAcknowledge(alert.id)
                  onClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: 'rgba(255,170,0,0.15)',
                  border: '1px solid rgba(255,170,0,0.4)',
                  color: '#ffaa00',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,170,0,0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,170,0,0.15)')}
              >
                <UserCheck size={14} />
                <span>Acknowledge Threat</span>
              </button>
            )}

            {/* Resolve Button */}
            {alert.status !== 'RESOLVED' && (
              <button
                id="btn-resolve-alert"
                onClick={() => {
                  onResolve && onResolve(alert.id)
                  onClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: 'rgba(0,230,118,0.15)',
                  border: '1px solid rgba(0,230,118,0.4)',
                  color: '#00e676',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,230,118,0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,230,118,0.15)')}
              >
                <CheckCircle size={14} />
                <span>Mark as Resolved</span>
              </button>
            )}

            {/* Close Modal Button */}
            <button
              id="btn-close-modal"
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

export default AlertDetailModal
