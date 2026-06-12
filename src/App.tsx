import { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  Bell,
  Bolt,
  CalendarDays,
  Leaf,
  RefreshCw,
  UserCircle,
  Zap,
} from 'lucide-react'
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
  const cleanestDay = energyMix.reduce<DailyEnergyMix | null>(
    (bestDay, day) =>
      !bestDay || day.cleanEnergyPercentage > bestDay.cleanEnergyPercentage
        ? day
        : bestDay,
    null,
  )
  const averageCleanEnergy =
    energyMix.length > 0
      ? energyMix.reduce((total, day) => total + day.cleanEnergyPercentage, 0) /
        energyMix.length
      : null
  const totalIntervals = energyMix.reduce(
    (total, day) => total + day.intervalCount,
    0,
  )

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
              <>
                <div className="overview-grid" aria-label="Energy mix summary">
                  <article className="metric-card metric-card--strong">
                    <span className="metric-icon">
                      <Leaf size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <p>Cleanest Day</p>
                      <strong>
                        {cleanestDay
                          ? ENERGY_LABELS[energyMix.indexOf(cleanestDay)] ??
                            cleanestDay.date
                          : 'No data'}
                      </strong>
                      <span>
                        {cleanestDay
                          ? `${cleanestDay.cleanEnergyPercentage.toFixed(2)}% clean`
                          : 'Waiting for forecast'}
                      </span>
                    </div>
                  </article>

                  <article className="metric-card">
                    <span className="metric-icon">
                      <BarChart3 size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <p>Average Clean Share</p>
                      <strong>
                        {averageCleanEnergy
                          ? `${averageCleanEnergy.toFixed(2)}%`
                          : 'No data'}
                      </strong>
                      <span>Across the displayed forecast</span>
                    </div>
                  </article>

                  <article className="metric-card">
                    <span className="metric-icon">
                      <CalendarDays size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <p>Data Coverage</p>
                      <strong>{totalIntervals} intervals</strong>
                      <span>Half-hour generation samples</span>
                    </div>
                  </article>
                </div>

                <div className="energy-grid">
                  {energyMix.map((day, index) => (
                    <EnergyPieChart
                      key={day.date}
                      day={day}
                      label={ENERGY_LABELS[index] ?? day.date}
                    />
                  ))}
                </div>
              </>
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

            <div className="charging-overview-grid" aria-label="Charging summary">
              <article className="metric-card metric-card--strong">
                <span className="metric-icon">
                  <Bolt size={19} aria-hidden="true" />
                </span>
                <div>
                  <p>Selected Duration</p>
                  <strong>{hours} h</strong>
                  <span>{hours * 2} half-hour intervals</span>
                </div>
              </article>

              <article className="metric-card">
                <span className="metric-icon">
                  <CalendarDays size={19} aria-hidden="true" />
                </span>
                <div>
                  <p>Forecast Horizon</p>
                  <strong>48 h</strong>
                  <span>Tomorrow and the day after</span>
                </div>
              </article>

              <article className="metric-card">
                <span className="metric-icon">
                  <Leaf size={19} aria-hidden="true" />
                </span>
                <div>
                  <p>Current Recommendation</p>
                  <strong>
                    {chargingResult && !chargingError
                      ? `${chargingResult.cleanEnergyPercentage.toFixed(2)}%`
                      : chargingLoading
                        ? 'Calculating'
                        : 'Unavailable'}
                  </strong>
                  <span>Average clean energy share</span>
                </div>
              </article>
            </div>
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
