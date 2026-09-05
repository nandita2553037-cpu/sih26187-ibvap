// src/pages/Analytics.jsx
//
// ─── BACKEND INTEGRATION GUIDE ──────────────────────────────────────────────
//
// API Endpoints:
//   GET /api/analytics/trends?period=24h|7d|30d  → Time-series detection trends
//   GET /api/analytics/breakdown?by=severity|type → Category metrics
//
// Example FastAPI integration:
// const [analytics, setAnalytics] = useState(null)
// useEffect(() => {
//   fetch(`/api/analytics/trends?period=${timePeriod}`)
//     .then(res => res.json())
//     .then(data => setAnalytics(data))
// }, [timePeriod])
//
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import {
  BarChart2,
  TrendingUp,
  Users,
  Truck,
  Bell,
  AlertTriangle,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  PieChart as PieIcon,
  Layers,
  Camera,
  CheckCircle2,
  Cpu,
  Clock,
} from 'lucide-react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

import { analyticsChartData, CAMERA_LOCATIONS } from '../data/mockData'

// Custom Tooltip for Dark Command-Center Theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(8,12,20,0.92)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '8px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 700 }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ color: entry.color || entry.fill || '#fff', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: entry.color || entry.fill }} />
            <span>{entry.name || entry.dataKey}:</span>
            <strong style={{ marginLeft: 'auto' }}>{entry.value}</strong>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function Analytics() {
  // Time Period Filter State: '24h' | '7d' | '30d'
  const [timePeriod, setTimePeriod] = useState('7d')

  // Selected Camera Filter State
  const [selectedCamera, setSelectedCamera] = useState('ALL')

  // Refresh animation state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('10:52:14')

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour12: false }))
      setIsRefreshing(false)
    }, 600)
  }

  // Active time series dataset based on filter
  const timeSeriesData = useMemo(() => {
    if (timePeriod === '24h') return analyticsChartData.todayHourly
    if (timePeriod === '30d') return analyticsChartData.thirtyDaysDaily
    return analyticsChartData.sevenDaysDaily
  }, [timePeriod])

  // Filtered Camera Performance dataset
  const cameraPerfData = useMemo(() => {
    if (selectedCamera === 'ALL') return analyticsChartData.cameraPerformance
    return analyticsChartData.cameraPerformance.filter((c) => c.camera === selectedCamera)
  }, [selectedCamera])

  // Export handler
  const handleExportData = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analyticsChartData, null, 2)
    )}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonStr)
    downloadAnchor.setAttribute('download', `IBVAP_Analytics_Report_${timePeriod}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1600, margin: '0 auto' }}>
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              AI Video Analytics & Metrics
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
              <Cpu size={12} />
              AI MODEL METRICS ACTIVE
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Statistical trends, detection performance, and threat severity distribution across border sectors
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Time Period Filter Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: 3,
              gap: 2,
            }}
          >
            {[
              { id: '24h', label: 'Today (24h)' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-period-${tab.id}`}
                onClick={() => setTimePeriod(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  background: timePeriod === tab.id ? 'var(--color-accent)' : 'transparent',
                  color: timePeriod === tab.id ? '#000' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export Report Action */}
          <button
            id="btn-export-analytics"
            onClick={handleExportData}
            title="Export Analytics Data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 6,
              background: 'rgba(0,212,255,0.12)',
              border: '1px solid rgba(0,212,255,0.3)',
              color: 'var(--color-accent)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.22)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.12)')}
          >
            <Download size={13} />
            <span>Export Data</span>
          </button>

          {/* Refresh Button */}
          <button
            id="btn-refresh-analytics"
            onClick={handleRefresh}
            title="Refresh Metrics"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

        </div>
      </div>

      {/* ── 1. Top Summary KPI Cards ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        
        {/* People Detected */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>People Detected</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {analyticsChartData.summary.totalPersons.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: '#00e676', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <TrendingUp size={10} /> +14.2% vs previous period
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#00d4ff" />
          </div>
        </div>

        {/* Vehicles Detected */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Vehicles Detected</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#a78bfa', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {analyticsChartData.summary.totalVehicles.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: '#00e676', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <TrendingUp size={10} /> +8.6% ANPR Scans
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="#a78bfa" />
          </div>
        </div>

        {/* Total Threat Alerts */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Threat Alerts</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ffaa00', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {analyticsChartData.summary.totalAlerts}
            </div>
            <div style={{ fontSize: 10, color: '#ffaa00', marginTop: 2 }}>
              {analyticsChartData.summary.avgResponseTime} avg triage time
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color="#ffaa00" />
          </div>
        </div>

        {/* Critical Alerts */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Critical Alerts</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ff3b3b', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {analyticsChartData.summary.criticalAlerts}
            </div>
            <div style={{ fontSize: 10, color: '#ff3b3b', marginTop: 2 }}>
              Immediate triage logged
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#ff3b3b" />
          </div>
        </div>

        {/* AI Engine Uptime */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>AI Engine Health</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#00e676', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {analyticsChartData.summary.aiUptime}
            </div>
            <div style={{ fontSize: 10, color: '#00e676', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle2 size={10} /> 5/6 Nodes Operational
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="#00e676" />
          </div>
        </div>

      </div>

      {/* ── 2. Primary Time Series Charts Grid (2 Columns) ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        
        {/* Chart 1: People & Vehicle Detection Trends */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Detection Volume Trends Over Time
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Hourly/daily counts for human pedestrians vs vehicle traffic
              </div>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', padding: '2px 6px', background: 'rgba(0,212,255,0.1)', borderRadius: 4 }}>
              {timePeriod.toUpperCase()} TREND
            </span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPersons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={timePeriod === '24h' ? 'time' : 'date'} stroke="var(--color-text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="persons" name="Persons" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#colorPersons)" />
                <Area type="monotone" dataKey="vehicles" name="Vehicles" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorVehicles)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Threat Alert Volume Trend */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Threat Alert Frequency
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Real-time security alert triggers flagged by AI model
              </div>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#ffaa00', padding: '2px 6px', background: 'rgba(255,170,0,0.1)', borderRadius: 4 }}>
              ALERTS
            </span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={timePeriod === '24h' ? 'time' : 'date'} stroke="var(--color-text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="alerts" name="Alerts" fill="#ffaa00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── 3. Categorical Analytics Grid (3 Columns) ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Chart 3: Alerts by Severity Donut Chart */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Alerts by Severity Level
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsChartData.alertsBySeverity}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analyticsChartData.alertsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Events by Type Bar Chart */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Incidents by Event Type
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsChartData.eventsByType} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--color-text-muted)" fontSize={10} />
                <YAxis dataKey="type" type="category" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Event Count" radius={[0, 4, 4, 0]}>
                  {analyticsChartData.eventsByType.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Camera Sector Activity Breakdown */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Camera Sector Activity
            </div>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 11,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Nodes</option>
              {analyticsChartData.cameraPerformance.map((c) => (
                <option key={c.camera} value={c.camera}>
                  {c.camera} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cameraPerfData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="camera" stroke="var(--color-text-muted)" fontSize={10} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{value}</span>} />
                <Bar dataKey="persons" name="Persons" fill="#00d4ff" radius={[2, 2, 0, 0]} />
                <Bar dataKey="vehicles" name="Vehicles" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="alerts" name="Alerts" fill="#ffaa00" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Analytics
