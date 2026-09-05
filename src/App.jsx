import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// Page imports
import Dashboard    from './pages/Dashboard'
import LiveCameras  from './pages/LiveCameras'
import Alerts       from './pages/Alerts'
import Map          from './pages/Map'
import Investigation from './pages/Investigation'
import Analytics    from './pages/Analytics'
import Settings     from './pages/Settings'

function Layout() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--color-bg-base)',
      }}
      className="bg-grid"
    >
      {/* ── Left Sidebar ── */}
      <Sidebar />

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* ── Top Navigation Bar ── */}
        <TopBar />

        {/* ── Page content ── */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--color-bg-base)',
          }}
        >
          <Routes>
            <Route path="/"              element={<Dashboard />}    />
            <Route path="/cameras"       element={<LiveCameras />}  />
            <Route path="/alerts"        element={<Alerts />}       />
            <Route path="/map"           element={<Map />}          />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/analytics"     element={<Analytics />}    />
            <Route path="/settings"      element={<Settings />}     />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
