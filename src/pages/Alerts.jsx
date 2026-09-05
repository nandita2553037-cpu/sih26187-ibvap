// src/pages/Alerts.jsx
//
// ─── BACKEND INTEGRATION GUIDE ──────────────────────────────────────────────
//
// API Endpoints:
//   GET /api/alerts               → List all threat alerts
//   POST /api/alerts/:id/ack      → Acknowledge an alert
//   POST /api/alerts/:id/resolve  → Resolve an alert
//
// Example FastAPI WebSocket binding:
// useEffect(() => {
//   const ws = new WebSocket('ws://localhost:8000/ws/alerts')
//   ws.onmessage = (event) => {
//     const newAlert = JSON.parse(event.data)
//     setAlerts(prev => [newAlert, ...prev])
//   }
//   return () => ws.close()
// }, [])
//
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  UserCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  Camera,
  Radio,
} from 'lucide-react'

import { alertsData, CAMERA_LOCATIONS } from '../data/mockData'
import RiskBadge from '../components/dashboard/RiskBadge'
import AlertDetailModal from '../components/dashboard/AlertDetailModal'

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['UNACKNOWLEDGED', 'ACKNOWLEDGED', 'RESOLVED']
const CAMERAS = ['CAM-001', 'CAM-002', 'CAM-003', 'CAM-004', 'CAM-005', 'CAM-006']

function getRiskColor(score) {
  if (score >= 81) return '#ff3b3b'
  if (score >= 61) return '#ff7043'
  if (score >= 31) return '#ffaa00'
  return '#00e676'
}

function Alerts() {
  // Local state for list of alerts so status changes (Ack/Resolve) update live
  const [alerts, setAlerts] = useState(alertsData)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedCamera, setSelectedCamera] = useState('ALL')
  const [selectedEventType, setSelectedEventType] = useState('ALL')

  // Sorting state: 'risk-desc' | 'risk-asc' | 'time-desc' | 'time-asc'
  const [sortBy, setSortBy] = useState('risk-desc')

  // Selected Alert for Detail Modal
  const [selectedAlertModal, setSelectedAlertModal] = useState(null)

  // Feedback Notification Message (e.g. "Alert ALT-001 Acknowledged")
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Action Handlers
  const handleAcknowledge = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    )
    showToast(`Alert ${alertId} marked as ACKNOWLEDGED`)
  }

  const handleResolve = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
    )
    showToast(`Alert ${alertId} marked as RESOLVED`)
  }

  // Dynamic Event Types extracted from current alerts
  const availableEventTypes = useMemo(() => {
    const types = new Set(alerts.map((a) => a.event))
    return Array.from(types)
  }, [alerts])

  // Filtered & Sorted Alerts computation
  const filteredAndSortedAlerts = useMemo(() => {
    let result = alerts.filter((alert) => {
      // 1. Search Query (matches ID, event, camera, or location)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchId = alert.id.toLowerCase().includes(q)
        const matchEvent = alert.event.toLowerCase().includes(q)
        const matchCam = alert.cameraId.toLowerCase().includes(q)
        const matchLoc = alert.location.toLowerCase().includes(q)
        if (!matchId && !matchEvent && !matchCam && !matchLoc) return false
      }

      // 2. Severity Filter
      if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) {
        return false
      }

      // 3. Status Filter
      if (selectedStatus !== 'ALL' && alert.status !== selectedStatus) {
        return false
      }

      // 4. Camera Filter
      if (selectedCamera !== 'ALL' && alert.cameraId !== selectedCamera) {
        return false
      }

      // 5. Event Type Filter
      if (selectedEventType !== 'ALL' && alert.event !== selectedEventType) {
        return false
      }

      return true
    })

    // Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'risk-desc') return b.riskScore - a.riskScore
      if (sortBy === 'risk-asc') return a.riskScore - b.riskScore
      if (sortBy === 'time-desc') return b.time.localeCompare(a.time)
      if (sortBy === 'time-asc') return a.time.localeCompare(b.time)
      return 0
    })

    return result
  }, [alerts, searchQuery, selectedSeverity, selectedStatus, selectedCamera, selectedEventType, sortBy])

  // KPI Summary Metrics
  const totalCount = alerts.length
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length
  const unackCount = alerts.filter((a) => a.status === 'UNACKNOWLEDGED').length
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSeverity !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedCamera !== 'ALL' ||
    selectedEventType !== 'ALL'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedSeverity('ALL')
    setSelectedStatus('ALL')
    setSelectedCamera('ALL')
    setSelectedEventType('ALL')
    setSortBy('risk-desc')
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1600, margin: '0 auto' }}>
      
      {/* ── Toast Notification Banner ─────────────────────────────── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            right: 24,
            zIndex: 10000,
            background: 'rgba(0, 230, 118, 0.15)',
            border: '1px solid rgba(0, 230, 118, 0.4)',
            color: '#00e676',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={16} color="#00e676" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Threat Alerts & Incidents
            </h1>
            {unackCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(255,59,59,0.12)',
                  border: '1px solid rgba(255,59,59,0.4)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ff3b3b',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b3b', animation: 'pulse-dot 1s infinite' }} />
                {unackCount} UNACKNOWLEDGED
              </div>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Real-time AI detection threat alerts requiring tactical acknowledgement and triage
          </p>
        </div>
      </div>

      {/* ── 1. KPI Summary Row ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        
        {/* Total Alerts */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Alerts</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{totalCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color="#00d4ff" />
          </div>
        </div>

        {/* Critical Alerts */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Critical Severity</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ff3b3b', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{criticalCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#ff3b3b" />
          </div>
        </div>

        {/* High Severity */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>High Severity</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ff7043', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{highCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,112,67,0.1)', border: '1px solid rgba(255,112,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} color="#ff7043" />
          </div>
        </div>

        {/* Unacknowledged */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Unacknowledged</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ffaa00', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{unackCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} color="#ffaa00" />
          </div>
        </div>

        {/* Resolved */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Resolved</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#00e676', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{resolvedCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} color="#00e676" />
          </div>
        </div>

      </div>

      {/* ── 2. Search & Filter Bar ───────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
            <Search
              size={15}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              id="alert-search-input"
              type="text"
              placeholder="Search alert ID, event, camera or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Container */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            
            {/* Severity Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Severity:</span>
              <select
                id="filter-severity-select"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Severities</option>
                {SEVERITIES.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Status:</span>
              <select
                id="filter-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Statuses</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Camera:</span>
              <select
                id="filter-camera-select"
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                style={{
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Cameras</option>
                {CAMERAS.map((cam) => (
                  <option key={cam} value={cam}>
                    {cam}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Event:</span>
              <select
                id="filter-event-select"
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                style={{
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: 160,
                }}
              >
                <option value="ALL">All Event Types</option>
                {availableEventTypes.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={13} color="var(--color-accent)" />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Sort By:</span>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="risk-desc">Risk: Highest First</option>
                <option value="risk-asc">Risk: Lowest First</option>
                <option value="time-desc">Time: Newest First</option>
                <option value="time-asc">Time: Oldest First</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                id="clear-alert-filters-btn"
                onClick={handleResetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  background: 'rgba(255,59,59,0.1)',
                  border: '1px solid rgba(255,59,59,0.3)',
                  color: '#ff3b3b',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <XCircle size={12} />
                <span>Reset</span>
              </button>
            )}

          </div>
        </div>

        {/* Counter row */}
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
          Showing <strong style={{ color: 'var(--color-accent)' }}>{filteredAndSortedAlerts.length}</strong> of {alerts.length} threat alerts
        </div>

      </div>

      {/* ── 3. Alerts Table / List ───────────────────────────────────── */}
      {filteredAndSortedAlerts.length > 0 ? (
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--color-bg-overlay)',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '12px 16px' }}>Alert ID</th>
                  <th style={{ padding: '12px 16px' }}>Severity</th>
                  <th style={{ padding: '12px 16px' }}>Event Type</th>
                  <th style={{ padding: '12px 16px' }}>Camera</th>
                  <th style={{ padding: '12px 16px' }}>Location / Zone</th>
                  <th style={{ padding: '12px 16px' }}>Risk Score</th>
                  <th style={{ padding: '12px 16px' }}>Time</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedAlerts.map((alert, index) => {
                  const riskColor = getRiskColor(alert.riskScore)
                  const isUnack = alert.status === 'UNACKNOWLEDGED'

                  return (
                    <tr
                      key={alert.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: isUnack ? 'rgba(255,59,59,0.025)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isUnack ? 'rgba(255,59,59,0.025)' : 'transparent')}
                    >
                      {/* Alert ID */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                        {alert.id}
                      </td>

                      {/* Severity */}
                      <td style={{ padding: '12px 16px' }}>
                        <RiskBadge severity={alert.severity} small />
                      </td>

                      {/* Event Type */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {alert.event}
                      </td>

                      {/* Camera */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                        {alert.cameraId}
                      </td>

                      {/* Location & Zone */}
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                        <div>{alert.location}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{alert.zone || 'Sector Alpha'}</div>
                      </td>

                      {/* Risk Score */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 120 }}>
                          <div
                            style={{
                              flex: 1,
                              height: 5,
                              background: 'var(--color-bg-overlay)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${alert.riskScore}%`,
                                height: '100%',
                                background: riskColor,
                              }}
                            />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: riskColor, minWidth: 24, textAlign: 'right' }}>
                            {alert.riskScore}
                          </span>
                        </div>
                      </td>

                      {/* Time */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        {alert.time}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '3px 8px',
                            borderRadius: 4,
                            background:
                              alert.status === 'UNACKNOWLEDGED'
                                ? 'rgba(255,59,59,0.1)'
                                : alert.status === 'ACKNOWLEDGED'
                                ? 'rgba(255,170,0,0.1)'
                                : 'rgba(0,230,118,0.1)',
                            color:
                              alert.status === 'UNACKNOWLEDGED'
                                ? '#ff3b3b'
                                : alert.status === 'ACKNOWLEDGED'
                                ? '#ffaa00'
                                : '#00e676',
                            border: `1px solid ${
                              alert.status === 'UNACKNOWLEDGED'
                                ? 'rgba(255,59,59,0.3)'
                                : alert.status === 'ACKNOWLEDGED'
                                ? 'rgba(255,170,0,0.3)'
                                : 'rgba(0,230,118,0.3)'
                            }`,
                          }}
                        >
                          {alert.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          
                          {/* View Modal */}
                          <button
                            id={`tbl-view-${alert.id.toLowerCase()}`}
                            onClick={() => setSelectedAlertModal(alert)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--color-accent)',
                              background: 'rgba(0,212,255,0.08)',
                              border: '1px solid rgba(0,212,255,0.25)',
                              padding: '4px 8px',
                              borderRadius: 5,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.18)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>

                          {/* Quick Acknowledge inline */}
                          {alert.status === 'UNACKNOWLEDGED' && (
                            <button
                              id={`tbl-ack-${alert.id.toLowerCase()}`}
                              title="Acknowledge Alert"
                              onClick={() => handleAcknowledge(alert.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#ffaa00',
                                background: 'rgba(255,170,0,0.08)',
                                border: '1px solid rgba(255,170,0,0.3)',
                                padding: '4px 8px',
                                borderRadius: 5,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,170,0,0.18)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,170,0,0.08)')}
                            >
                              <UserCheck size={12} />
                              <span>Ack</span>
                            </button>
                          )}

                          {/* Quick Resolve inline */}
                          {alert.status !== 'RESOLVED' && (
                            <button
                              id={`tbl-resolve-${alert.id.toLowerCase()}`}
                              title="Mark as Resolved"
                              onClick={() => handleResolve(alert.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#00e676',
                                background: 'rgba(0,230,118,0.08)',
                                border: '1px solid rgba(0,230,118,0.3)',
                                padding: '4px 8px',
                                borderRadius: 5,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,230,118,0.18)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,230,118,0.08)')}
                            >
                              <CheckCircle size={12} />
                              <span>Resolve</span>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px dashed var(--color-border)',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ShieldAlert size={40} color="var(--color-text-muted)" strokeWidth={1.5} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No threat alerts matched your filter criteria
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 400 }}>
            Try clearing active search terms or adjusting severity/status filters.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              marginTop: 8,
              padding: '8px 16px',
              borderRadius: 6,
              background: 'var(--color-accent)',
              border: 'none',
              color: '#000',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ── 4. Alert Detail Modal ───────────────────────────────────── */}
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

export default Alerts
