import { Clock, Loader2, Search, Zap } from 'lucide-react'
import type { ChargingWindowResult } from '../types/energy'
import { formatDateTime, formatPercent } from '../utils/format'

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

            <div className="timeline">
              <div className="timeline-labels">
                <span>Next 48 hours</span>
                <span>Best {hours}H window</span>
              </div>
              <div className="timeline-bar" aria-hidden="true">
                <span className="timeline-muted" />
                <span className="timeline-mixed" />
                <span className="timeline-active" />
                <span className="timeline-muted" />
                <span className="timeline-mixed" />
              </div>
              <div className="timeline-legend">
                <span><i className="legend-clean" />Optimal Window</span>
                <span><i className="legend-muted" />Higher Carbon Intensity</span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
