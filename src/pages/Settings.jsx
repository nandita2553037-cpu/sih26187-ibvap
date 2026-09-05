// src/pages/Settings.jsx
import { useState } from 'react'
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Server,
  Radio,
  Bell,
  Volume2,
  VolumeX,
  Save,
  CheckCircle2,
  Cpu,
  Lock,
  RefreshCw,
} from 'lucide-react'

function Settings() {
  const [fastApiUrl, setFastApiUrl] = useState('http://localhost:8000')
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/ws')
  const [personConfidence, setPersonConfidence] = useState(85)
  const [vehicleConfidence, setVehicleConfidence] = useState(90)
  const [thermalSensitivity, setThermalSensitivity] = useState(75)
  const [hardwareAccel, setHardwareAccel] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [autoAckLow, setAutoAckLow] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const handleSave = () => {
    setToastMessage('System configuration saved successfully!')
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            right: 24,
            zIndex: 10000,
            background: 'rgba(0, 230, 118, 0.15)',
            border: '1px solid rgba(0, 230, 118, 0.4)',
            color: '#00e676',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={16} color="#00e676" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              System Configuration
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
              <SettingsIcon size={12} />
              COMMAND SYSTEM SETTINGS
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            FastAPI backend endpoints, AI inference threshold parameters, and alert notification triggers
          </p>
        </div>

        <button
          id="btn-save-settings"
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 6,
            background: 'var(--color-accent)',
            border: 'none',
            color: '#000',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(0,212,255,0.25)',
          }}
        >
          <Save size={14} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* ── Settings Grid ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        
        {/* Box 1: FastAPI Backend Integration */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={16} color="var(--color-accent)" />
            <span>FastAPI Server & Stream Bindings</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                FastAPI REST API Endpoint Base URL
              </label>
              <input
                type="text"
                value={fastApiUrl}
                onChange={(e) => setFastApiUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                WebSocket Telemetry Stream URL
              </label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
              <div>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>H.265 / GPU Hardware Acceleration</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Use WebGPU / WebGL hardware decode for CCTV streams</div>
              </div>
              <input
                type="checkbox"
                checked={hardwareAccel}
                onChange={(e) => setHardwareAccel(e.target.checked)}
                style={{ cursor: 'pointer', width: 16, height: 16 }}
              />
            </div>
          </div>
        </div>

        {/* Box 2: AI Detection Model Thresholds */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={16} color="#a78bfa" />
            <span>AI Inference Sensitivity Parameters</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Human Person Detection (YOLOv8)</span>
                <span style={{ color: '#00d4ff', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{personConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={personConfidence}
                onChange={(e) => setPersonConfidence(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>ANPR Vehicle Recognition Confidence</span>
                <span style={{ color: '#a78bfa', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{vehicleConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={vehicleConfidence}
                onChange={(e) => setVehicleConfidence(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Thermal Tripwire Elevation Threshold</span>
                <span style={{ color: '#ffaa00', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{thermalSensitivity}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={thermalSensitivity}
                onChange={(e) => setThermalSensitivity(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Box 3: Notification & Audio Alerts */}
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} color="#ffaa00" />
            <span>Alert Alarm & Audio Notifications</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Audio Alarm Beeper for Critical Alerts</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Play high-pitch alert chime on critical tripwire breach</div>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                style={{ cursor: 'pointer', width: 16, height: 16 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Auto-Clear Low Severity False Alarms</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Automatically resolve low-risk animal/shadow detections</div>
              </div>
              <input
                type="checkbox"
                checked={autoAckLow}
                onChange={(e) => setAutoAckLow(e.target.checked)}
                style={{ cursor: 'pointer', width: 16, height: 16 }}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Settings
