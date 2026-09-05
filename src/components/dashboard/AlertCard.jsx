// src/components/dashboard/AlertCard.jsx
import { Eye, MapPin, Clock } from 'lucide-react'
import RiskBadge from './RiskBadge'

// Risk score 0–100 → LOW/MEDIUM/HIGH/CRITICAL label + bar color
function getRiskColor(score) {
  if (score >= 81) return '#ff3b3b'
  if (score >= 61) return '#ff7043'
  if (score >= 31) return '#ffaa00'
  return '#00e676'
}

const STATUS_STYLES = {
  UNACKNOWLEDGED: { color: '#ff3b3b', bg: 'rgba(255,59,59,0.1)',   border: 'rgba(255,59,59,0.3)'   },
  ACKNOWLEDGED:   { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)',   border: 'rgba(255,170,0,0.3)'   },
  RESOLVED:       { color: '#00e676', bg: 'rgba(0,230,118,0.1)',   border: 'rgba(0,230,118,0.3)'   },
}

function AlertCard({ alert, onView }) {
  const riskColor = getRiskColor(alert.riskScore)
  const statusStyle = STATUS_STYLES[alert.status] ?? STATUS_STYLES.ACKNOWLEDGED
  const isUnack = alert.status === 'UNACKNOWLEDGED'

  return (
    <div
      style={{
        background: isUnack ? 'rgba(255,59,59,0.04)' : 'var(--color-bg-elevated)',
        border: `1px solid ${isUnack ? 'rgba(255,59,59,0.2)' : 'var(--color-border)'}`,
        borderRadius: 8,
        padding: '10px 12px',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Row 1: severity + event + view button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flex: 1, minWidth: 0 }}>
          <RiskBadge severity={alert.severity} small />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {alert.event}
          </span>
        </div>
        <button
          id={`alert-view-${alert.id.toLowerCase()}`}
          aria-label={`View alert ${alert.id}`}
          onClick={() => onView && onView(alert)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 5, padding: '3px 7px',
            fontSize: 10, fontWeight: 600, color: 'var(--color-accent)',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.16)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
        >
          <Eye size={10} strokeWidth={2} />
          View
        </button>
      </div>

      {/* Row 2: camera + location + time */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 6, fontSize: 10, color: 'var(--color-text-muted)',
        }}
      >
        <span className="mono" style={{ color: 'var(--color-text-secondary)' }}>
          {alert.cameraId}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MapPin size={9} strokeWidth={2} />
          {alert.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
          <Clock size={9} strokeWidth={2} />
          {alert.time}
        </span>
      </div>

      {/* Row 3: risk score bar + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        {/* Risk bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            Risk
          </span>
          <div
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: 'var(--color-bg-overlay)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${alert.riskScore}%`,
                height: '100%',
                background: riskColor,
                borderRadius: 2,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10, fontWeight: 700,
              color: riskColor,
              fontFamily: 'var(--font-mono)',
              minWidth: 22, textAlign: 'right',
            }}
          >
            {alert.riskScore}
          </span>
        </div>

        {/* Status badge */}
        <span
          style={{
            fontSize: 9, fontWeight: 700,
            color: statusStyle.color,
            background: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            borderRadius: 4,
            padding: '1px 6px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {alert.status === 'UNACKNOWLEDGED' ? 'UNACK' : alert.status}
        </span>
      </div>
    </div>
  )
}

export default AlertCard
