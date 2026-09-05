// src/pages/Dashboard.jsx
import { Camera, Bell, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

import StatCard      from '../components/dashboard/StatCard'
import CameraCard    from '../components/dashboard/CameraCard'
import AlertCard     from '../components/dashboard/AlertCard'
import LiveActivity  from '../components/dashboard/LiveActivity'
import SystemStatus  from '../components/dashboard/SystemStatus'
import LiveCameraModal from '../components/dashboard/LiveCameraModal'
import AlertDetailModal from '../components/dashboard/AlertDetailModal'

import {
  statsData,
  camerasData,
  alertsData,
  activityData,
  systemStatusData,
} from '../data/mockData'

// ── Section header helper ─────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, badge, badgeColor, right }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon size={14} color="var(--color-accent)" strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
        {badge && (
          <span
            style={{
              fontSize: 9, fontWeight: 700,
              background: `${badgeColor ?? 'var(--color-accent)'}18`,
              color: badgeColor ?? 'var(--color-accent)',
              border: `1px solid ${badgeColor ?? 'var(--color-accent)'}40`,
              borderRadius: 4, padding: '1px 6px',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {right && (
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{right}</span>
      )}
    </div>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────
function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedCameraModal, setSelectedCameraModal] = useState(null)
  const [selectedAlertModal, setSelectedAlertModal] = useState(null)
  const [activeAlerts, setActiveAlerts] = useState(alertsData)

  // Simulate a refresh tick every 30s
  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const onlineCams   = camerasData.filter(c => c.status === 'online').length
  const unackAlerts  = activeAlerts.filter(a => a.status === 'UNACKNOWLEDGED').length
  const critAlerts   = activeAlerts.filter(a => a.severity === 'CRITICAL').length

  const handleAcknowledge = (alertId) => {
    setActiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
  }

  const handleResolve = (alertId) => {
    setActiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
  }

  return (
    <div
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        minHeight: '100%',
      }}
    >
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2
            style={{
              fontSize: 16, fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '0.01em',
            }}
          >
            Command Overview
          </h2>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Real-time AI-powered border surveillance · Sector A–D
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Critical alert chip */}
          {critAlerts > 0 && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,59,59,0.1)',
                border: '1px solid rgba(255,59,59,0.35)',
                borderRadius: 6, padding: '4px 10px',
                fontSize: 11, color: '#ff3b3b', fontWeight: 600,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff3b3b', animation: 'pulse-dot 1s infinite' }} />
              {critAlerts} Critical Alert{critAlerts > 1 ? 's' : ''}
            </div>
          )}

          {/* Last updated */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10, color: 'var(--color-text-muted)',
            }}
          >
            <RefreshCw size={11} strokeWidth={2} color="var(--color-text-muted)" />
            Updated {lastUpdated.toLocaleTimeString('en-IN', { hour12: false })}
          </div>
        </div>
      </div>

      {/* ── Row 1: Stat Cards ────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 12,
        }}
      >
        {statsData.map(stat => (
          <StatCard key={stat.id} data={stat} />
        ))}
      </div>

      {/* ── Row 2: Cameras (left) + Alerts (right) ──────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* Camera monitoring section */}
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <SectionHeader
            icon={Camera}
            title="Live Camera Monitoring"
            badge={`${onlineCams} online`}
            badgeColor="var(--color-success)"
            right={`${camerasData.length} cameras total`}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {camerasData.map(cam => (
              <CameraCard
                key={cam.id}
                camera={cam}
                onViewDetails={(c) => setSelectedCameraModal(c)}
              />
            ))}
          </div>
        </div>

        {/* Alert panel */}
        <div
          className="glass-card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SectionHeader
            icon={Bell}
            title="Real-Time Alerts"
            badge={unackAlerts > 0 ? `${unackAlerts} unacknowledged` : null}
            badgeColor="#ff3b3b"
            right={`${activeAlerts.length} total`}
          />

          {/* Scrollable alert list */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              overflowY: 'auto',
              maxHeight: 480,
              paddingRight: 2,
            }}
          >
            {activeAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onView={(a) => setSelectedAlertModal(a)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Live Activity (left) + System Status (right) ─────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <LiveActivity data={activityData} />
        <SystemStatus data={systemStatusData} />
      </div>

      {/* Telemetry Modals */}
      {selectedCameraModal && (
        <LiveCameraModal
          camera={selectedCameraModal}
          onClose={() => setSelectedCameraModal(null)}
        />
      )}

      {selectedAlertModal && (
        <AlertDetailModal
          alert={selectedAlertModal}
          onClose={() => setSelectedAlertModal(null)}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      )}
    </div>
  )
}

export default Dashboard
