// src/pages/Map.jsx
//
// ─── BACKEND INTEGRATION GUIDE (SIH26187) ──────────────────────────────────
//
// API Endpoints:
//   GET /api/cameras/map    → Real-time geospatial coordinates & status
//   GET /api/zones          → Sector boundary polygons & threat levels
//
// Example WebSocket Binding:
// useEffect(() => {
//   const ws = new WebSocket('ws://localhost:8000/ws/map/telemetry')
//   ws.onmessage = (e) => setMapData(JSON.parse(e.data))
//   return () => ws.close()
// }, [])
//
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import {
  MapPin,
  Camera,
  CameraOff,
  AlertTriangle,
  Radio,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  Eye,
  Users,
  Truck,
  Clock,
  CheckCircle2,
  Navigation,
  Compass,
  Activity,
  Sliders,
  Crosshair,
  Filter,
  ShieldAlert,
  Bell,
} from 'lucide-react'

import { allCamerasData, mapZonesData, alertsData } from '../data/mockData'
import RiskBadge from '../components/dashboard/RiskBadge'
import CCTVScreen from '../components/shared/CCTVScreen'
import LiveCameraModal from '../components/dashboard/LiveCameraModal'

function MapPage() {
  // Map Filter State: 'ALL' | 'ONLINE' | 'OFFLINE' | 'ALERTS'
  const [filterState, setFilterState] = useState('ALL')

  // Selected Camera Pin for Side Panel
  const [selectedCamera, setSelectedCamera] = useState(allCamerasData[2]) // Default to CAM-003 (Critical Intrusion)

  // Selected Camera for Full Detail Modal
  const [modalCamera, setModalCamera] = useState(null)

  // Map Controls State
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showZones, setShowZones] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showRadar, setShowRadar] = useState(true)

  // Map Zoom Control Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))
  const handleResetZoom = () => {
    setZoomLevel(1)
    setSelectedCamera(allCamerasData[2])
  }

  // Filter Cameras logic
  const filteredCameras = useMemo(() => {
    return allCamerasData.filter((cam) => {
      if (filterState === 'ONLINE') return cam.status === 'online'
      if (filterState === 'OFFLINE') return cam.status === 'offline'
      if (filterState === 'ALERTS') return cam.hasAlert || cam.riskLevel === 'CRITICAL' || cam.riskLevel === 'HIGH'
      return true
    })
  }, [filterState])

  // Active alerts for quick jump sidebar
  const activeAlerts = useMemo(() => {
    return alertsData.filter((a) => a.status !== 'RESOLVED')
  }, [])

  // Counts for Top Header Tabs
  const totalCount = allCamerasData.length
  const onlineCount = allCamerasData.filter((c) => c.status === 'online').length
  const offlineCount = allCamerasData.filter((c) => c.status === 'offline').length
  const alertCount = allCamerasData.filter((c) => c.hasAlert || c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length

  // Select camera matching zone click
  const handleZoneClick = (zoneId) => {
    const camMatch = allCamerasData.find((c) => c.zone?.toLowerCase().includes(zoneId.replace('ZONE-', '').toLowerCase()) || c.location.toLowerCase().includes(zoneId.replace('ZONE-', '').toLowerCase()))
    if (camMatch) {
      setSelectedCamera(camMatch)
    }
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1600, margin: '0 auto', height: '100%' }}>
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Border Surveillance Map
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
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse-dot 1s infinite' }} />
              SIH26187 • SECTOR ALPHA–ECHO GRID
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Geospatial command map showing live CCTV node coordinates, security zones, and tripwire boundaries
          </p>
        </div>

        {/* Quick Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { id: 'ALL', label: `All Cameras (${totalCount})`, color: 'var(--color-accent)' },
            { id: 'ONLINE', label: `Online (${onlineCount})`, color: '#00e676' },
            { id: 'OFFLINE', label: `Offline (${offlineCount})`, color: '#ff3b3b' },
            { id: 'ALERTS', label: `Active Alerts (${alertCount})`, color: '#ffaa00' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`filter-map-${tab.id.toLowerCase()}`}
              onClick={() => setFilterState(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                border: '1px solid',
                borderColor: filterState === tab.id ? tab.color : 'var(--color-border)',
                background: filterState === tab.id ? `${tab.color}18` : 'var(--color-bg-elevated)',
                color: filterState === tab.id ? tab.color : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Map Workspace (Grid: Map Canvas 72%, Side Telemetry 28%) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'stretch' }}>
        
        {/* ── Left Container: Interactive Border Map Canvas ──────────── */}
        <div
          style={{
            gridColumn: 'span 2',
            position: 'relative',
            background: '#040812',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            minHeight: 580,
            overflow: 'hidden',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Map Toolbar (Top Right Overlay) */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(8,12,20,0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: 4,
            }}
          >
            {/* Layer Toggles */}
            <button
              onClick={() => setShowZones(!showZones)}
              title="Toggle Security Zones"
              style={{
                padding: '5px 8px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                border: 'none',
                background: showZones ? 'rgba(0,212,255,0.2)' : 'transparent',
                color: showZones ? 'var(--color-accent)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Shield size={12} />
              <span>Zones</span>
            </button>

            <button
              onClick={() => setShowRoutes(!showRoutes)}
              title="Toggle Patrol Routes"
              style={{
                padding: '5px 8px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                border: 'none',
                background: showRoutes ? 'rgba(255,170,0,0.2)' : 'transparent',
                color: showRoutes ? '#ffaa00' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Navigation size={12} />
              <span>Fence/Patrol</span>
            </button>

            <button
              onClick={() => setShowRadar(!showRadar)}
              title="Toggle Radar Sweep"
              style={{
                padding: '5px 8px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                border: 'none',
                background: showRadar ? 'rgba(0,230,118,0.2)' : 'transparent',
                color: showRadar ? '#00e676' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Radio size={12} />
              <span>Radar</span>
            </button>

            <div style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 2px' }} />

            {/* Zoom Controls */}
            <button
              id="map-zoom-in"
              onClick={handleZoomIn}
              title="Zoom In"
              style={{ background: 'none', border: 'none', color: '#fff', padding: 4, cursor: 'pointer' }}
            >
              <ZoomIn size={14} />
            </button>
            <button
              id="map-zoom-out"
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{ background: 'none', border: 'none', color: '#fff', padding: 4, cursor: 'pointer' }}
            >
              <ZoomOut size={14} />
            </button>
            <button
              id="map-reset-zoom"
              onClick={handleResetZoom}
              title="Reset Map View"
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', padding: 4, cursor: 'pointer' }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Map Top HUD Status (Top Left Overlay) */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(8,12,20,0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Compass size={13} color="var(--color-accent)" />
              <span>LAT: 31.6340° N</span>
            </div>
            <span>•</span>
            <div>LNG: 74.8720° E</div>
            <span>•</span>
            <div style={{ color: 'var(--color-accent)' }}>GRID: SECTOR 4B</div>
          </div>

          {/* Map Tactical Canvas Area */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease-out',
            }}
          >
            {/* 1. Tactical Matrix Grid Background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(0,212,255,0.035) 1px, transparent 1px),' +
                  'linear-gradient(90deg, rgba(0,212,255,0.035) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />

            {/* 2. SVG Vector Layer (Zones, Border Lines, Patrol Routes, Radar Sweep) */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              {/* Primary International Border Fence Line */}
              {showRoutes && (
                <g>
                  {/* Border Glow Line */}
                  <path
                    d="M 50 160 Q 300 120 500 130 T 950 170"
                    fill="none"
                    stroke="rgba(0,212,255,0.4)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  {/* Animated Border Pulses */}
                  <circle cx="280" cy="132" r="4" fill="#00d4ff">
                    <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="650" cy="142" r="4" fill="#00d4ff">
                    <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="0.8s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}

              {/* Mobile Patrol Route Alpha */}
              {showRoutes && (
                <path
                  d="M 120 420 L 300 410 L 520 380 L 780 430"
                  fill="none"
                  stroke="rgba(255,170,0,0.4)"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                />
              )}

              {/* Security Sector Polygons */}
              {showZones &&
                mapZonesData.map((zone) => (
                  <g key={zone.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => handleZoneClick(zone.id)}>
                    <rect
                      x={`${zone.bounds.left}%`}
                      y={`${zone.bounds.top}%`}
                      width={`${zone.bounds.width}%`}
                      height={`${zone.bounds.height}%`}
                      fill={`${zone.color}08`}
                      stroke={`${zone.color}35`}
                      strokeWidth="1.5"
                      strokeDasharray={zone.riskLevel === 'CRITICAL' ? '4 2' : 'none'}
                      rx="8"
                    />
                    <text
                      x={`${zone.bounds.left + 1.5}%`}
                      y={`${zone.bounds.top + 4.5}%`}
                      fill={zone.color}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                      letterSpacing="0.04em"
                    >
                      {zone.name.split('—')[0].trim()}
                    </text>
                  </g>
                ))}

              {/* Radar Sweep Effect (Centered around Restricted Zone A) */}
              {showRadar && (
                <g transform="translate(520, 160)">
                  <circle cx="0" cy="0" r="140" fill="none" stroke="rgba(0,230,118,0.15)" strokeWidth="1" />
                  <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(0,230,118,0.2)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(0,230,118,0.25)" strokeWidth="1" />
                  
                  {/* Rotating Sweeping Radar Beam */}
                  <g className="radar-sweep-beam">
                    <path
                      d="M 0 0 L 140 0 A 140 140 0 0 1 0 140 Z"
                      fill="url(#radar-gradient)"
                      opacity="0.4"
                    />
                  </g>

                  <defs>
                    <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0,230,118,0.4)" />
                      <stop offset="100%" stopColor="rgba(0,230,118,0.0)" />
                    </linearGradient>
                  </defs>
                </g>
              )}
            </svg>

            {/* 3. Interactive Camera Marker Pins */}
            {filteredCameras.map((camera) => {
              const isSelected = selectedCamera?.id === camera.id
              const isOnline = camera.status === 'online'
              const isCritical = camera.riskLevel === 'CRITICAL'
              const isHigh = camera.riskLevel === 'HIGH'
              const hasWarning = isCritical || isHigh || camera.hasAlert

              const markerColor = isCritical
                ? '#ff3b3b'
                : isHigh
                ? '#ffaa00'
                : isOnline
                ? '#00d4ff'
                : '#718096'

              return (
                <div
                  key={camera.id}
                  id={`map-pin-${camera.id.toLowerCase()}`}
                  onClick={() => setSelectedCamera(camera)}
                  style={{
                    position: 'absolute',
                    left: `${camera.mapCoords.x}%`,
                    top: `${camera.mapCoords.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 10 : 5,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.2s',
                  }}
                >
                  {/* Critical Intrusion Alert Beacon Pulsing Rings */}
                  {isCritical && (
                    <div
                      style={{
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(255,59,59,0.25)',
                        border: '2px solid #ff3b3b',
                        animation: 'pulse-dot 1.2s infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Marker Pin Icon Badge */}
                  <div
                    style={{
                      width: isSelected ? 36 : 30,
                      height: isSelected ? 36 : 30,
                      borderRadius: '50%',
                      background: isSelected ? `${markerColor}30` : 'rgba(8,12,20,0.9)',
                      border: `2px solid ${markerColor}`,
                      boxShadow: isSelected ? `0 0 20px ${markerColor}` : '0 4px 10px rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isOnline ? (
                      <Camera size={isSelected ? 18 : 14} color={markerColor} />
                    ) : (
                      <CameraOff size={14} color="#718096" />
                    )}
                  </div>

                  {/* Camera ID Label Box */}
                  <div
                    style={{
                      marginTop: 4,
                      background: 'rgba(4,8,16,0.92)',
                      border: `1px solid ${isSelected ? markerColor : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 4,
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 800, color: markerColor, fontFamily: 'var(--font-mono)' }}>
                      {camera.id}
                    </span>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 600 }}>
                      {camera.location}
                    </span>
                  </div>

                  {/* Warning Pill if Critical Alert */}
                  {isCritical && (
                    <div
                      className="alert-blink"
                      style={{
                        marginTop: 2,
                        background: '#ff3b3b',
                        color: '#fff',
                        fontSize: 8,
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 2,
                        letterSpacing: '0.05em',
                      }}
                    >
                      ⚠️ INTRUSION
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Map Bottom Legend Overlay */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(8,12,20,0.9)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              fontSize: 11,
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Online Node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b3b' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Critical Alert</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#718096' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Signal Lost</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 2, background: '#ffaa00', display: 'inline-block' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Patrol Route</span>
              </div>
            </div>

            <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              CLICK ANY MARKER TO VIEW LIVE TELEMETRY
            </div>
          </div>

        </div>

        {/* ── Right Container: Side Telemetry Information Panel ─────── */}
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            justify: 'space-between',
          }}
        >
          {selectedCamera ? (
            <>
              {/* Selected Node Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Selected Node Telemetry
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {selectedCamera.id}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {selectedCamera.location}
                    </div>
                  </div>
                  <RiskBadge severity={selectedCamera.riskLevel} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <span className={`status-dot ${selectedCamera.status === 'online' ? 'online' : 'offline'}`} />
                  <span style={{ textTransform: 'uppercase', fontWeight: 600, color: selectedCamera.status === 'online' ? '#00e676' : '#ff3b3b' }}>
                    {selectedCamera.status}
                  </span>
                  <span>•</span>
                  <span>{selectedCamera.zone || 'Sector Alpha'}</span>
                </div>
              </div>

              {/* CCTV Live Screen Preview (reused component!) */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                <CCTVScreen camera={selectedCamera} />
              </div>

              {/* Live Detection Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Persons</span>
                    <Users size={14} color="#00d4ff" />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {selectedCamera.status === 'online' ? selectedCamera.persons : 0}
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Vehicles</span>
                    <Truck size={14} color="#ffaa00" />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#ffaa00', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {selectedCamera.status === 'online' ? selectedCamera.vehicles : 0}
                  </div>
                </div>
              </div>

              {/* Threat Level Bar */}
              <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Risk Threat Meter</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: selectedCamera.riskScore > 80 ? '#ff3b3b' : '#00e676' }}>
                    {selectedCamera.riskScore} / 100
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${selectedCamera.riskScore}%`,
                      height: '100%',
                      background: selectedCamera.riskScore > 80 ? '#ff3b3b' : selectedCamera.riskScore > 50 ? '#ffaa00' : '#00e676',
                    }}
                  />
                </div>
              </div>

              {/* Last Event Activity */}
              <div style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  <Clock size={12} color="var(--color-accent)" />
                  <span>Last Activity Event</span>
                </div>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {selectedCamera.status === 'online' ? (selectedCamera.lastEvent || 'Routine sector check') : 'Signal lost on this node'}
                </div>
              </div>

              {/* View Full Stream Modal Action Button */}
              <button
                id="btn-map-view-full-stream"
                onClick={() => setModalCamera(selectedCamera)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'rgba(0,212,255,0.12)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  color: 'var(--color-accent)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,255,0.22)'
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,255,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'
                }}
              >
                <Eye size={14} />
                <span>Open Full Node Telemetry</span>
              </button>
            </>
          ) : (
            /* Empty Side State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, textAlign: 'center', padding: 20 }}>
              <Crosshair size={32} color="var(--color-text-muted)" />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>No Node Selected</div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Click any camera marker on the map to inspect live CCTV telemetry.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Full Camera Telemetry Modal Integration ─────────────────── */}
      {modalCamera && (
        <LiveCameraModal
          camera={modalCamera}
          onClose={() => setModalCamera(null)}
        />
      )}

    </div>
  )
}

export default MapPage
