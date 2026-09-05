import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Camera,
  Bell,
  Map,
  Search,
  BarChart2,
  Settings,
  Shield,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/cameras',       icon: Camera,          label: 'Live Cameras'  },
  { to: '/alerts',        icon: Bell,            label: 'Alerts'        },
  { to: '/map',           icon: Map,             label: 'Map'           },
  { to: '/investigation', icon: Search,          label: 'Investigation' },
  { to: '/analytics',     icon: BarChart2,       label: 'Analytics'     },
  { to: '/settings',      icon: Settings,        label: 'Settings'      },
]

function Sidebar() {
  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo / Branding */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--color-accent), #0066aa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px var(--color-accent-glow)',
            flexShrink: 0,
          }}
        >
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--color-accent)',
              lineHeight: 1.2,
            }}
          >
            IBVAP
          </div>
          <div
            style={{
              fontSize: '9px',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Border Command
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <div
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            padding: '4px 12px 8px',
          }}
        >
          Navigation
        </div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 2,
              fontSize: '13.5px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              background: isActive
                ? 'linear-gradient(90deg, rgba(0,212,255,0.12) 0%, transparent 100%)'
                : 'transparent',
              borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '10px',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="status-dot online" />
          System Operational
        </div>
        <div className="mono" style={{ marginTop: 4, color: 'var(--color-text-muted)' }}>
          v1.0.0 — SIH 2026
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
