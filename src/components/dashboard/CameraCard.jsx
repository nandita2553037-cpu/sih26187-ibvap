// src/components/dashboard/CameraCard.jsx
import { useState, useEffect } from 'react'
import { CameraOff, Maximize2, Users, Truck, Info, Clock, AlertTriangle } from 'lucide-react'
import RiskBadge from './RiskBadge'
import CCTVScreen from '../shared/CCTVScreen'

function CameraCard({ camera, onViewDetails }) {
  const isOnline = camera.status === 'online'
  const isCritical = camera.riskLevel === 'CRITICAL'
  const isHigh = camera.riskLevel === 'HIGH'

  const cardBorderColor = isCritical
    ? 'rgba(255,59,59,0.5)'
    : isHigh
    ? 'rgba(255,112,67,0.4)'
    : 'var(--color-border)'

  const cardClassName = isCritical ? 'camera-card-critical' : ''

  const handleFullscreen = (e) => {
    e.stopPropagation()
    if (onViewDetails) {
      onViewDetails(camera)
    }
  }

  return (
    <div
      className={cardClassName}
      style={{
        background: 'var(--color-bg-elevated)',
        border: `1px solid ${cardBorderColor}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'all 0.25s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── CCTV Screen Section ──────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          background: '#040a10',
          overflow: 'hidden',
          cursor: onViewDetails ? 'pointer' : 'default',
        }}
        onClick={() => onViewDetails && onViewDetails(camera)}
      >
        <CCTVScreen camera={camera} />
      </div>

      {/* ── Card Content Body ─────────────────────────────────────────── */}
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Row 1: Status badge, Risk Badge, Detections breakdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {camera.status}
              </span>
            </div>
            <RiskBadge severity={camera.riskLevel} small />
          </div>

          {/* Person & Vehicle Counts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOnline && camera.persons > 0 && (
              <div
                title={`${camera.persons} Persons Detected`}
                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                <Users size={12} color="#00d4ff" strokeWidth={2} />
                <span>{camera.persons}</span>
              </div>
            )}
            {isOnline && camera.vehicles > 0 && (
              <div
                title={`${camera.vehicles} Vehicles Detected`}
                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                <Truck size={12} color="#ffaa00" strokeWidth={2} />
                <span>{camera.vehicles}</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Last Event snippet */}
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-base)',
            padding: '6px 8px',
            borderRadius: 6,
            marginBottom: 10,
            border: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 30,
          }}
        >
          {isOnline ? (
            <>
              <Clock size={11} color="var(--color-accent)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {camera.lastEvent || 'No recent events recorded'}
              </span>
              {camera.lastEventTime && (
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    marginLeft: 'auto',
                    flexShrink: 0,
                  }}
                >
                  {camera.lastEventTime}
                </span>
              )}
            </>
          ) : (
            <>
              <AlertTriangle size={11} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--color-danger)', fontSize: 10, fontWeight: 500 }}>
                SIGNAL LOST — Last seen at {camera.lastSeen || 'N/A'}
              </span>
            </>
          )}
        </div>

        {/* Row 3: Action Buttons */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingTop: 6,
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            id={`btn-view-details-${camera.id.toLowerCase()}`}
            onClick={() => onViewDetails && onViewDetails(camera)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-accent)',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              padding: '4px 10px',
              borderRadius: 5,
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,212,255,0.18)'
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,212,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'
            }}
          >
            <Info size={12} />
            <span>View Details</span>
          </button>

          <button
            id={`camera-fullscreen-${camera.id.toLowerCase()}`}
            aria-label={`Fullscreen ${camera.id}`}
            title="Expand Full View"
            onClick={handleFullscreen}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '4px 8px',
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'var(--color-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            <Maximize2 size={12} />
            <span>Expand</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CameraCard
