// src/components/dashboard/RiskBadge.jsx
// Reusable severity / risk badge — used in AlertCard, CameraCard, etc.

const SEVERITY_CONFIG = {
  CRITICAL: { bg: 'rgba(255,59,59,0.14)',   color: '#ff3b3b', border: 'rgba(255,59,59,0.4)',   pulse: true  },
  HIGH:     { bg: 'rgba(255,112,67,0.14)',  color: '#ff7043', border: 'rgba(255,112,67,0.4)',  pulse: false },
  MEDIUM:   { bg: 'rgba(255,170,0,0.14)',   color: '#ffaa00', border: 'rgba(255,170,0,0.4)',   pulse: false },
  LOW:      { bg: 'rgba(0,230,118,0.12)',   color: '#00e676', border: 'rgba(0,230,118,0.35)',  pulse: false },
  OFFLINE:  { bg: 'rgba(100,100,120,0.14)', color: '#6b7280', border: 'rgba(100,100,120,0.3)', pulse: false },
}

function RiskBadge({ severity, small = false }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.LOW

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 4,
        padding: small ? '1px 5px' : '2px 8px',
        fontSize: small ? 9 : 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {cfg.pulse && (
        <span
          style={{
            width: small ? 4 : 5,
            height: small ? 4 : 5,
            borderRadius: '50%',
            background: cfg.color,
            display: 'inline-block',
            animation: 'pulse-dot 1.2s infinite',
            flexShrink: 0,
          }}
        />
      )}
      {severity}
    </span>
  )
}

export default RiskBadge
