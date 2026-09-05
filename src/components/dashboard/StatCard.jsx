// src/components/dashboard/StatCard.jsx
import { Camera, CameraOff, Users, Truck, Bell, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

const ICON_MAP = { Camera, CameraOff, Users, Truck, Bell, AlertTriangle }

function StatCard({ data }) {
  const Icon = ICON_MAP[data.iconName]

  return (
    <div
      className="glass-card glass-card-hover"
      style={{ padding: '16px 18px', cursor: 'default' }}
    >
      {/* Top row: value + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: data.color,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {data.value.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginTop: 5,
              fontWeight: 500,
            }}
          >
            {data.label}
          </div>
        </div>

        {/* Icon box */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: data.bg,
            border: `1px solid ${data.color}35`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {Icon && <Icon size={18} color={data.color} strokeWidth={1.8} />}
        </div>
      </div>

      {/* Bottom trend */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          color: 'var(--color-text-muted)',
        }}
      >
        {data.trendPositive ? (
          <TrendingUp size={11} color="var(--color-success)" strokeWidth={2} />
        ) : (
          <TrendingDown size={11} color="var(--color-danger)" strokeWidth={2} />
        )}
        <span>{data.trend}</span>
      </div>
    </div>
  )
}

export default StatCard
