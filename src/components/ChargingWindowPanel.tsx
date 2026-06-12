import { Clock, Loader2, Search, Zap } from 'lucide-react'
import type { ChargingWindowResult } from '../types/energy'
import { formatDateTime, formatPercent } from '../utils/format'

const HALF_HOUR_IN_MS = 30 * 60 * 1000
const FORECAST_HORIZON_IN_MS = 48 * 60 * 60 * 1000

interface ChargingWindowPanelProps {
  hours: number
  isLoading: boolean
  result: ChargingWindowResult | null
  error: string | null
  onHoursChange: (hours: number) => void
  onRefresh: () => void
}

export function ChargingWindowPanel({
  hours,
  isLoading,
  result,
  error,
  onHoursChange,
  onRefresh,
}: ChargingWindowPanelProps) {
  const timelineWindow = result ? getTimelineWindow(result) : null

  return (
    <section className="charging-panel" aria-labelledby="charging-heading">
      <div className="duration-card">
        <div className="panel-title">
          <span className="icon-badge">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="charging-heading">Duration</h2>
            <p>Select how long you need to charge your EV.</p>
          </div>
        </div>

        <div className="duration-value">{hours} h</div>
        <input
          id="charging-hours"
          aria-label="Charging duration"
          className="duration-slider"
          min="1"
          max="6"
          step="1"
          type="range"
          value={hours}
          onChange={(event) => onHoursChange(Number(event.target.value))}
        />
        <div className="duration-scale" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <span key={value}>{value}h</span>
          ))}
        </div>

        <div className="duration-insights" aria-label="Charging calculation details">
          <div>
            <span>Interval size</span>
            <strong>30 min</strong>
          </div>
          <div>
            <span>Intervals used</span>
            <strong>{hours * 2}</strong>
          </div>
        </div>

        <button className="primary-action" type="button" onClick={onRefresh}>
          <Search size={18} aria-hidden="true" />
          Find Optimal Window
        </button>
      </div>

      {isLoading && (
        <div className="result-state">
          <Loader2 className="spin" size={20} aria-hidden="true" />
          <span>Calculating optimal window</span>
        </div>
      )}

      {!isLoading && error && <div className="error-box">{error}</div>}

      {!isLoading && !error && result && (
        <>
          <div className="recommendation-card">
            <div className="recommendation-top">
              <div>
                <div className="recommendation-label">
                  <Zap size={18} aria-hidden="true" />
                  Recommended Window
                </div>
                <p>Based on {hours}H duration preference.</p>
              </div>
              <span>{formatPercent(result.cleanEnergyPercentage)} Clean Energy</span>
            </div>

            <dl className="window-grid">
              <div>
                <dt>Start</dt>
                <dd>{formatDateTime(result.start)}</dd>
              </div>
              <div>
                <dt>End</dt>
                <dd>{formatDateTime(result.end)}</dd>
              </div>
            </dl>

            {timelineWindow && (
              <div className="window-timeline" aria-label="Recommended window on 48 hour forecast">
                <div className="window-timeline__labels">
                  <span>Now</span>
                  <span>+24h</span>
                  <span>+48h</span>
                </div>
                <div className="window-timeline__bar">
                  <span
                    className="window-timeline__active"
                    style={{
                      left: `${timelineWindow.left}%`,
                      width: `${timelineWindow.width}%`,
                    }}
                  />
                </div>
                <div className="window-timeline__caption">
                  Recommended window starts about {timelineWindow.startOffsetHours}h
                  from now and lasts {hours}h.
                </div>
              </div>
            )}

            <div className="recommendation-details" aria-label="Recommendation details">
              <div>
                <dt>Duration</dt>
                <dd>{hours} h</dd>
              </div>
              <div>
                <dt>Intervals</dt>
                <dd>{hours * 2}</dd>
              </div>
              <div>
                <dt>Average Clean Energy</dt>
                <dd>{formatPercent(result.cleanEnergyPercentage)}</dd>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function getTimelineWindow(result: ChargingWindowResult) {
  const horizonStart = roundDownToHalfHour(new Date()).getTime()
  const start = new Date(result.start).getTime()
  const end = new Date(result.end).getTime()
  const rawLeft = ((start - horizonStart) / FORECAST_HORIZON_IN_MS) * 100
  const rawWidth = ((end - start) / FORECAST_HORIZON_IN_MS) * 100
  const left = clamp(rawLeft, 0, 100)
  const width = clamp(Math.min(rawWidth, 100 - left), 1.5, 100)

  return {
    left,
    width,
    startOffsetHours: Math.max(
      0,
      Math.round((start - horizonStart) / (60 * 60 * 1000)),
    ),
  }
}

function roundDownToHalfHour(date: Date): Date {
  return new Date(Math.floor(date.getTime() / HALF_HOUR_IN_MS) * HALF_HOUR_IN_MS)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
