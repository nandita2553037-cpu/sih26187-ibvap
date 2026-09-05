import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, User, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

const ROUTE_TITLES = {
  '/':              'Dashboard',
  '/cameras':       'Live Cameras',
  '/alerts':        'Alerts',
  '/map':           'Map',
  '/investigation': 'Investigation',
  '/analytics':     'Analytics',
  '/settings':      'Settings',
}

function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = ROUTE_TITLES[pathname] ?? 'IBVAP'
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      {/* Left — page title */}
      <div>
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '10px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Intelligent Border Video Analytics Platform
        </p>
      </div>

      {/* Right — clock + alerts + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Live clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-text-secondary)',
          }}
        >
          <Clock size={13} />
          <span className="mono" style={{ fontSize: '12px' }}>
            {time.toLocaleTimeString('en-IN', { hour12: false })}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>IST</span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 22,
            background: 'var(--color-border)',
          }}
        />

        {/* Alert bell */}
        <button
          id="topbar-alerts-btn"
          aria-label="View alerts"
          onClick={() => navigate('/alerts')}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <Bell size={17} />
          <span
            className="badge"
            style={{ position: 'absolute', top: 0, right: 0 }}
          >
            3
          </span>
        </button>

        {/* User avatar */}
        <button
          id="topbar-user-btn"
          aria-label="User profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '5px 10px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'border-color var(--transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <User size={14} />
          <span>Operator</span>
        </button>
      </div>
    </header>
  )
}

export default TopBar
