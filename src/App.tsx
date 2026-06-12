import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Bell, Bolt, RefreshCw, UserCircle, Zap } from 'lucide-react'
import { fetchBestChargingWindow, fetchDailyEnergyMix } from './api/energyApi'
import './App.css'
import { ChargingWindowPanel } from './components/ChargingWindowPanel'
import { EnergyPieChart } from './components/EnergyPieChart'
import type { ChargingWindowResult, DailyEnergyMix } from './types/energy'

type Page = 'energy-mix' | 'charging-time'

const ENERGY_LABELS = ['Today', 'Tomorrow', 'Day After Tomorrow']

function App() {
  const [activePage, setActivePage] = useState<Page>('energy-mix')
  const [energyMix, setEnergyMix] = useState<DailyEnergyMix[]>([])
  const [mixLoading, setMixLoading] = useState(true)
  const [mixError, setMixError] = useState<string | null>(null)
  const [hours, setHours] = useState(3)
  const [chargingResult, setChargingResult] =
    useState<ChargingWindowResult | null>(null)
  const [chargingLoading, setChargingLoading] = useState(true)
  const [chargingError, setChargingError] = useState<string | null>(null)

  const loadEnergyMix = useCallback(async () => {
    setMixLoading(true)
    setMixError(null)

    try {
      setEnergyMix(await fetchDailyEnergyMix())
    } catch (error) {
      setMixError(
        error instanceof Error
          ? error.message
          : 'Could not load energy mix data',
      )
    } finally {
      setMixLoading(false)
    }
  }, [])

  const loadChargingWindow = useCallback(async () => {
    setChargingLoading(true)
    setChargingError(null)

    try {
      setChargingResult(await fetchBestChargingWindow(hours))
    } catch (error) {
      setChargingError(
        error instanceof Error
          ? error.message
          : 'Could not calculate charging window',
      )
      setChargingResult(null)
    } finally {
      setChargingLoading(false)
    }
  }, [hours])

  useEffect(() => {
    queueMicrotask(() => {
      void loadEnergyMix()
    })
  }, [loadEnergyMix])

  useEffect(() => {
    queueMicrotask(() => {
      void loadChargingWindow()
    })
  }, [loadChargingWindow])

  function renderNavigationItem(page: Page, label: string, icon: 'mix' | 'charge') {
    const isActive = activePage === page
    const Icon = icon === 'mix' ? BarChart3 : Bolt

    return (
      <button
        className={isActive ? 'nav-item nav-item--active' : 'nav-item'}
        type="button"
        onClick={() => setActivePage(page)}
      >
        <Icon size={20} aria-hidden="true" />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="app-layout">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark">
            <Zap size={21} aria-hidden="true" />
          </span>
          <div>
            <strong>EV Energy Optimizer</strong>
            <span>Grid Balancing Pro</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {renderNavigationItem('energy-mix', 'Energy Mix', 'mix')}
          {renderNavigationItem('charging-time', 'Charging Time', 'charge')}
        </nav>
      </aside>

      <header className="mobile-topbar">
        <strong>EV Energy Optimizer</strong>
        <div>
          <Bell size={21} aria-hidden="true" />
          <UserCircle size={23} aria-hidden="true" />
        </div>
      </header>

      <main className="main-canvas">
        {activePage === 'energy-mix' ? (
          <section className="page page--energy" aria-labelledby="energy-title">
            <header className="page-header">
              <div>
                <h1 id="energy-title">Energy Mix</h1>
                <p>Current and forecasted generation mix for Great Britain.</p>
              </div>
              <button className="secondary-action" type="button" onClick={loadEnergyMix}>
                <RefreshCw size={18} aria-hidden="true" />
                Refresh
              </button>
            </header>

            {mixLoading && <div className="loading-block">Loading generation data</div>}
            {!mixLoading && mixError && <div className="error-box">{mixError}</div>}
            {!mixLoading && !mixError && (
              <div className="energy-grid">
                {energyMix.map((day, index) => (
                  <EnergyPieChart
                    key={day.date}
                    day={day}
                    label={ENERGY_LABELS[index] ?? day.date}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="page page--charging" aria-labelledby="charging-title">
            <header className="page-header">
              <div>
                <h1 id="charging-title">Charging Time</h1>
                <p>Find the cleanest charging window in the next two days.</p>
              </div>
            </header>

            <ChargingWindowPanel
              hours={hours}
              isLoading={chargingLoading}
              result={chargingResult}
              error={chargingError}
              onHoursChange={setHours}
              onRefresh={loadChargingWindow}
            />
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {renderNavigationItem('energy-mix', 'Energy Mix', 'mix')}
        {renderNavigationItem('charging-time', 'Charging', 'charge')}
      </nav>
    </div>
  )
}

export default App
