// src/components/dashboard/LiveActivity.jsx
import { Activity } from 'lucide-react'

const TYPE_CONFIG = {
  critical: { color: '#ff3b3b', label: 'CRITICAL' },
  high:     { color: '#ff7043', label: 'HIGH'     },
  warning:  { color: '#ffaa00', label: 'WARN'     },
  info:     { color: '#00d4ff', label: 'INFO'     },
}

function LiveActivity({ data }) {
  return (
    <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Activity size={14} color="var(--color-accent)" strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Live Activity
          </span>
          <span
            style={{
              fontSize: 9, fontWeight: 700,
              background: 'rgba(0,230,118,0.12)',
              color: 'var(--color-success)',
              border: '1px solid rgba(0,230,118,0.3)',
              borderRadius: 4, padding: '1px 5px',
              letterSpacing: '0.08em',
            }}
          >
            LIVE
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          Last 30 min
        </span>
      </div>

      {/* Events */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {data.map((item, idx) => {
          const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info
          const isLast = idx === data.length - 1

          return (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                paddingBottom: isLast ? 0 : 10,
                marginBottom: isLast ? 0 : 10,
                borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: cfg.color,
                  marginTop: 4, flexShrink: 0,
                  boxShadow: `0 0 6px ${cfg.color}60`,
                }}
              />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11, color: 'var(--color-text-primary)',
                      fontWeight: 500, lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {item.event}
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}
                  >
                    {item.time}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span
                    style={{
                      fontSize: 9, fontWeight: 700,
                      color: cfg.color,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {cfg.label}
                  </span>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                    {item.camera}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LiveActivity
