// src/pages/Investigation.jsx
//
// ─── BACKEND INTEGRATION GUIDE ──────────────────────────────────────────────
//
// API Endpoints:
//   GET /api/investigations        → Query forensic incidents with search & filters
//   POST /api/investigations/export → Export PDF/ZIP forensic evidence dossier
//
// Example FastAPI integration:
// const [incidents, setIncidents] = useState([])
// useEffect(() => {
//   fetch('/api/investigations?query=' + searchQuery)
//     .then(res => res.json())
//     .then(data => setIncidents(data))
// }, [searchQuery])
//
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import {
  FileSearch,
  Search,
  Filter,
  Calendar,
  Camera,
  MapPin,
  Clock,
  ShieldAlert,
  XCircle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Download,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

import { investigationIncidentsData, CAMERA_LOCATIONS } from '../data/mockData'
import RiskBadge from '../components/dashboard/RiskBadge'
import InvestigationModal from '../components/dashboard/InvestigationModal'

const EVENT_TYPES = [
  'Restricted Zone Intrusion',
  'Loitering',
  'Unauthorized Vehicle',
  'Multiple Person Detection',
  'Vehicle Speed Anomaly',
  'Thermal Anomaly',
]

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['UNDER INVESTIGATION', 'ACKNOWLEDGED', 'RESOLVED', 'UNACKNOWLEDGED']
const CAMERAS = ['CAM-001', 'CAM-002', 'CAM-003', 'CAM-004', 'CAM-005', 'CAM-006']

function getRiskColor(score) {
  if (score >= 81) return '#ff3b3b'
  if (score >= 61) return '#ff7043'
  if (score >= 31) return '#ffaa00'
  return '#00e676'
}

function Investigation() {
  // Incident Data State
  const [incidents, setIncidents] = useState(investigationIncidentsData)

  // Search & Filter Input States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCamera, setSelectedCamera] = useState('ALL')
  const [selectedLocation, setSelectedLocation] = useState('ALL')
  const [selectedEventType, setSelectedEventType] = useState('ALL')
  const [selectedSeverity, setSelectedSeverity] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  
  // Date Range States
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [datePreset, setDatePreset] = useState('ALL')

  // Selected Incident for Detail Modal
  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null)

  // Update incident status handler
  const handleStatusChange = (incidentId, newStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    )
  }

  // Filtered Incidents calculation
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // 1. Free-text Search (matches ID, event, camera, location, summary, or investigator)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchId = inc.id.toLowerCase().includes(q)
        const matchEvent = inc.event.toLowerCase().includes(q)
        const matchCam = inc.cameraId.toLowerCase().includes(q)
        const matchLoc = inc.location.toLowerCase().includes(q)
        const matchSummary = (inc.summary || '').toLowerCase().includes(q)
        const matchInvestigator = (inc.investigator || '').toLowerCase().includes(q)
        if (!matchId && !matchEvent && !matchCam && !matchLoc && !matchSummary && !matchInvestigator) {
          return false
        }
      }

      // 2. Camera Filter
      if (selectedCamera !== 'ALL' && inc.cameraId !== selectedCamera) {
        return false
      }

      // 3. Location Filter
      if (selectedLocation !== 'ALL' && inc.location !== selectedLocation) {
        return false
      }

      // 4. Event Type Filter
      if (selectedEventType !== 'ALL' && inc.event !== selectedEventType) {
        return false
      }

      // 5. Severity Filter
      if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) {
        return false
      }

      // 6. Status Filter
      if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) {
        return false
      }

      // 7. Date Filter
      if (fromDate && inc.date < fromDate) return false
      if (toDate && inc.date > toDate) return false

      return true
    })
  }, [incidents, searchQuery, selectedCamera, selectedLocation, selectedEventType, selectedSeverity, selectedStatus, fromDate, toDate])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCamera !== 'ALL' ||
    selectedLocation !== 'ALL' ||
    selectedEventType !== 'ALL' ||
    selectedSeverity !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    fromDate !== '' ||
    toDate !== '' ||
    datePreset !== 'ALL'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCamera('ALL')
    setSelectedLocation('ALL')
    setSelectedEventType('ALL')
    setSelectedSeverity('ALL')
    setSelectedStatus('ALL')
    setFromDate('')
    setToDate('')
    setDatePreset('ALL')
  }

  // Quick Preset Date Selector
  const handleDatePresetChange = (preset) => {
    setDatePreset(preset)
    const todayStr = '2026-09-05'
    if (preset === 'TODAY') {
      setFromDate(todayStr)
      setToDate(todayStr)
    } else if (preset === '7DAYS') {
      setFromDate('2026-08-29')
      setToDate(todayStr)
    } else {
      setFromDate('')
      setToDate('')
    }
  }

  // KPI Summary Counts
  const totalCount = incidents.length
  const underInvestigationCount = incidents.filter((i) => i.status === 'UNDER INVESTIGATION').length
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1600, margin: '0 auto' }}>
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Forensic Incident Investigation
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-accent)',
              }}
            >
              <FileSearch size={12} />
              FORENSIC CASE SEARCH ACTIVE
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Multi-criteria threat intelligence search & forensic audit analysis across border CCTV logs
          </p>
        </div>
      </div>

      {/* ── 1. KPI Summary Cards ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        
        {/* Total Incidents */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Cases</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{totalCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSearch size={20} color="#00d4ff" />
          </div>
        </div>

        {/* Under Active Investigation */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active Cases</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ffaa00', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{underInvestigationCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} color="#ffaa00" />
          </div>
        </div>

        {/* Critical Cases */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Critical Threats</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ff3b3b', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{criticalCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#ff3b3b" />
          </div>
        </div>

        {/* Resolved Cases */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Resolved Dossiers</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#00e676', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{resolvedCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} color="#00e676" />
          </div>
        </div>

      </div>

      {/* ── 2. Search & Multi-Filter Console ────────────────────────── */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Row 1: Search Input & Date Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Main Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 450 }}>
            <Search
              size={15}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              id="investigation-search-input"
              type="text"
              placeholder="Search incident ID, event, camera, location or investigator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
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

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Date Range:</span>
            {[
              { id: 'ALL', label: 'All Dates' },
              { id: 'TODAY', label: 'Today' },
              { id: '7DAYS', label: 'Last 7 Days' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleDatePresetChange(p.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: datePreset === p.id ? 'var(--color-accent)' : 'var(--color-border)',
                  background: datePreset === p.id ? 'rgba(0,212,255,0.12)' : 'var(--color-bg-base)',
                  color: datePreset === p.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

        </div>

        {/* Row 2: Filter Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Camera Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Camera:</span>
            <select
              id="filter-inv-camera"
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
              {CAMERAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Location:</span>
            <select
              id="filter-inv-location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
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
              <option value="ALL">All Locations</option>
              {CAMERA_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Event Type:</span>
            <select
              id="filter-inv-event"
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
                maxWidth: 180,
              }}
            >
              <option value="ALL">All Event Types</option>
              {EVENT_TYPES.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Severity:</span>
            <select
              id="filter-inv-severity"
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
              id="filter-inv-status"
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

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="clear-investigation-filters-btn"
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
              <span>Clear Filters</span>
            </button>
          )}

        </div>

        {/* Counter row */}
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
          Showing <strong style={{ color: 'var(--color-accent)' }}>{filteredIncidents.length}</strong> matching forensic cases
        </div>

      </div>

      {/* ── 3. Forensic Investigation Results Table ─────────────────── */}
      {filteredIncidents.length > 0 ? (
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
                  <th style={{ padding: '12px 16px' }}>Incident ID</th>
                  <th style={{ padding: '12px 16px' }}>Severity</th>
                  <th style={{ padding: '12px 16px' }}>Event Type</th>
                  <th style={{ padding: '12px 16px' }}>Camera</th>
                  <th style={{ padding: '12px 16px' }}>Location / Zone</th>
                  <th style={{ padding: '12px 16px' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px' }}>Risk Score</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => {
                  const riskColor = getRiskColor(incident.riskScore)

                  return (
                    <tr
                      key={incident.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedIncidentModal(incident)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Incident ID */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                        {incident.id}
                      </td>

                      {/* Severity */}
                      <td style={{ padding: '12px 16px' }}>
                        <RiskBadge severity={incident.severity} small />
                      </td>

                      {/* Event Type */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {incident.event}
                      </td>

                      {/* Camera */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                        {incident.cameraId}
                      </td>

                      {/* Location & Zone */}
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                        <div>{incident.location}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{incident.zone || 'Sector Alpha'}</div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        <div>{incident.date}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{incident.time}</div>
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
                                width: `${incident.riskScore}%`,
                                height: '100%',
                                background: riskColor,
                              }}
                            />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: riskColor, minWidth: 24, textAlign: 'right' }}>
                            {incident.riskScore}
                          </span>
                        </div>
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
                              incident.status === 'UNDER INVESTIGATION'
                                ? 'rgba(0,212,255,0.1)'
                                : incident.status === 'RESOLVED'
                                ? 'rgba(0,230,118,0.1)'
                                : 'rgba(255,170,0,0.1)',
                            color:
                              incident.status === 'UNDER INVESTIGATION'
                                ? 'var(--color-accent)'
                                : incident.status === 'RESOLVED'
                                ? '#00e676'
                                : '#ffaa00',
                            border: `1px solid ${
                              incident.status === 'UNDER INVESTIGATION'
                                ? 'rgba(0,212,255,0.3)'
                                : incident.status === 'RESOLVED'
                                ? 'rgba(0,230,118,0.3)'
                                : 'rgba(255,170,0,0.3)'
                            }`,
                          }}
                        >
                          {incident.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          id={`btn-inspect-${incident.id.toLowerCase()}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIncidentModal(incident)
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--color-accent)',
                            background: 'rgba(0,212,255,0.08)',
                            border: '1px solid rgba(0,212,255,0.25)',
                            padding: '4px 10px',
                            borderRadius: 5,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.18)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
                        >
                          <Eye size={12} />
                          <span>Inspect Dossier</span>
                        </button>
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
          <FileSearch size={40} color="var(--color-text-muted)" strokeWidth={1.5} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No forensic cases match your search criteria
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 400 }}>
            Try broadening your search keywords or resetting active camera and severity filters.
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
            Clear All Filters
          </button>
        </div>
      )}

      {/* ── 4. Detailed Forensic Investigation Modal ────────────────── */}
      {selectedIncidentModal && (
        <InvestigationModal
          incident={selectedIncidentModal}
          onClose={() => setSelectedIncidentModal(null)}
          onStatusChange={handleStatusChange}
        />
      )}

    </div>
  )
}

export default Investigation
