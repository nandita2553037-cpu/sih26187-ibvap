// src/components/dashboard/SystemStatus.jsx
import { Server } from 'lucide-react'

const STATUS_CONFIG = {
  ONLINE:    { color: '#00e676', bg: 'rgba(0,230,118,0.1)',  border: 'rgba(0,230,118,0.3)'  },
  CONNECTED: { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.3)'  },
  DEGRADED:  { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)',  border: 'rgba(255,170,0,0.3)'  },
  OFFLINE:   { color: '#ff3b3b', bg: 'rgba(255,59,59,0.1)',  border: 'rgba(255,59,59,0.3)'  },
}

function SystemStatus({ data }) {
  const onlineCount = data.filter(s => s.status === 'ONLINE' || s.status === 'CONNECTED').length

  return (
    <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Server size={14} color="var(--color-accent)" strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            System Status
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {onlineCount}/{data.length} operational
        </span>
      </div>

      {/* Overall health bar */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            height: 4, borderRadius: 2,
            background: 'var(--color-bg-overlay)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(onlineCount / data.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00d4ff, #00e676)',
              borderRadius: 2,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--color-text-muted)' }}>
          <span>System Health</span>
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
            {Math.round((onlineCount / data.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Service rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map(service => {
          const cfg = STATUS_CONFIG[service.status] ?? STATUS_CONFIG.OFFLINE

          return (
            <div
              key={service.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 10px',
                background: 'var(--color-bg-overlay)',
                borderRadius: 7,
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Left: dot + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  className="status-dot"
                  style={{
                    background: cfg.color,
                    animation: service.status === 'ONLINE' || service.status === 'CONNECTED'
                      ? 'pulse-dot 2s infinite'
                      : 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {service.label}
                </span>
              </div>

              {/* Right: status badge + uptime */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {service.uptime}
                </span>
                <span
                  style={{
                    fontSize: 9, fontWeight: 700,
                    color: cfg.color,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    borderRadius: 4,
                    padding: '1px 6px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {service.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SystemStatus
