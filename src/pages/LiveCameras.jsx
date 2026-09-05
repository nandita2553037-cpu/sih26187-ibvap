// src/pages/LiveCameras.jsx
//
// ─── BACKEND INTEGRATION GUIDE ──────────────────────────────────────────────
//
// API Endpoints:
//   GET /api/cameras      → List of all cameras & live state
//   GET /api/cameras/:id  → Detail telemetry for single camera
//
// Example FastAPI integration:
// const [cameras, setCameras] = useState([])
// useEffect(() => {
//   fetch('/api/cameras')
//     .then(res => res.json())
//     .then(data => setCameras(data))
// }, [])
//
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import {
  Camera,
  Wifi,
  WifiOff,
  ScanSearch,
  BellRing,
  Search,
  Filter,
  RefreshCw,
  Grid,
  List,
  SlidersHorizontal,
  XCircle,
  Radio,
  CheckCircle,
} from 'lucide-react'

import {
  allCamerasData,
  camerasPageSummary,
  CAMERA_LOCATIONS,
  CAMERA_RISK_LEVELS,
} from '../data/mockData'

import CameraCard from '../components/dashboard/CameraCard'
import LiveCameraModal from '../components/dashboard/LiveCameraModal'

// Icon mapping for summary cards
const SUMMARY_ICON_MAP = {
  Camera: Camera,
  Wifi: Wifi,
  WifiOff: WifiOff,
  ScanSearch: ScanSearch,
  BellRing: BellRing,
}

function LiveCameras() {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedLocation, setSelectedLocation] = useState('ALL')
  const [selectedRisk, setSelectedRisk] = useState('ALL')
  
  // Layout View Mode (Grid vs List)
  const [viewMode, setViewMode] = useState('grid')

  // Selected Camera for Detail Modal
  const [selectedCameraModal, setSelectedCameraModal] = useState(null)

  // Last Updated Timestamp
  const [lastUpdated, setLastUpdated] = useState('10:52:14')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Manual refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour12: false }))
      setIsRefreshing(false)
    }, 600)
  }

  // Filtered cameras computation
  const filteredCameras = useMemo(() => {
    return allCamerasData.filter((cam) => {
      // 1. Search Query (matches ID, location, or zone)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchId = cam.id.toLowerCase().includes(q)
        const matchLoc = cam.location.toLowerCase().includes(q)
        const matchZone = (cam.zone || '').toLowerCase().includes(q)
        if (!matchId && !matchLoc && !matchZone) return false
      }

      // 2. Status Filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus.toLowerCase() !== cam.status.toLowerCase()) {
          return false
        }
      }

      // 3. Location Filter
      if (selectedLocation !== 'ALL') {
        if (cam.location !== selectedLocation) {
          return false
        }
      }

      // 4. Risk Level Filter
      if (selectedRisk !== 'ALL') {
        if (cam.riskLevel !== selectedRisk) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, selectedStatus, selectedLocation, selectedRisk])

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedLocation !== 'ALL' ||
    selectedRisk !== 'ALL'

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('ALL')
    setSelectedLocation('ALL')
    setSelectedRisk('ALL')
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1600, margin: '0 auto' }}>
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Live Camera Monitoring
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(0,230,118,0.1)',
                border: '1px solid rgba(0,230,118,0.3)',
                fontSize: 11,
                fontWeight: 600,
                color: '#00e676',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', animation: 'pulse-dot 1s infinite' }} />
              6 CCTV STREAMS ACTIVE
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Real-time AI-powered surveillance across monitored sectors
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Updated: {lastUpdated}
          </div>

          <button
            id="refresh-live-cameras-btn"
            onClick={handleRefresh}
            title="Refresh Camera Feeds"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: 12,
              fontWeight: 600,
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
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh Feeds</span>
          </button>
        </div>
      </div>

      {/* ── 1. Summary Cards ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {camerasPageSummary.map((item) => {
          const IconComponent = SUMMARY_ICON_MAP[item.iconName] || Camera
          return (
            <div
              key={item.id}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  {item.value}
                </div>
              </div>

              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                }}
              >
                <IconComponent size={20} color={item.color} />
              </div>
            </div>
          )
        })}
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
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
            <Search
              size={15}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              id="camera-search-input"
              type="text"
              placeholder="Search camera by ID, location or zone..."
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            
            {/* Status Selector */}
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
                <option value="ALL">All Status</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            {/* Location Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Location:</span>
              <select
                id="filter-location-select"
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

            {/* Risk Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Risk:</span>
              <select
                id="filter-risk-select"
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
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
                <option value="ALL">All Risk Levels</option>
                {CAMERA_RISK_LEVELS.map((risk) => (
                  <option key={risk} value={risk}>
                    {risk}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                id="clear-filters-btn"
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
                <span>Reset Filters</span>
              </button>
            )}

          </div>
        </div>

        {/* Toolbar Footer: Results Counter & View Mode Switcher */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: 12,
            color: 'var(--color-text-muted)',
          }}
        >
          <div>
            Showing <strong style={{ color: 'var(--color-accent)' }}>{filteredCameras.length}</strong> of{' '}
            {allCamerasData.length} camera sectors
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: viewMode === 'grid' ? 'var(--color-accent)' : 'var(--color-border)',
                background: viewMode === 'grid' ? 'rgba(0,212,255,0.12)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Grid size={14} />
            </button>
            <button
              id="view-mode-list"
              onClick={() => setViewMode('list')}
              title="List View"
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: viewMode === 'list' ? 'var(--color-accent)' : 'var(--color-border)',
                background: viewMode === 'list' ? 'rgba(0,212,255,0.12)' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <List size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* ── 3. Camera Grid / List ────────────────────────────────────── */}
      {filteredCameras.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              viewMode === 'grid'
                ? 'repeat(auto-fill, minmax(340px, 1fr))'
                : '1fr',
            gap: 20,
          }}
        >
          {filteredCameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onViewDetails={(cam) => setSelectedCameraModal(cam)}
            />
          ))}
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
          <Camera size={40} color="var(--color-text-muted)" strokeWidth={1.5} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No matching camera feeds found
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 400 }}>
            Try adjusting your search keywords or clearing active filters to see all available CCTV camera streams.
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

      {/* ── 4. Camera Detail Modal ───────────────────────────────────── */}
      {selectedCameraModal && (
        <LiveCameraModal
          camera={selectedCameraModal}
          onClose={() => setSelectedCameraModal(null)}
        />
      )}

    </div>
  )
}

export default LiveCameras
