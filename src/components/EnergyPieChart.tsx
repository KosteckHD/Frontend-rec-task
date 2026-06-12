import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { FUEL_COLORS, FUEL_LABELS, FUEL_ORDER } from '../constants/energy'
import type { DailyEnergyMix, FuelType } from '../types/energy'
import { formatDate, formatPercent } from '../utils/format'

interface ChartDataPoint {
  fuel: FuelType
  name: string
  value: number
}

interface EnergyPieChartProps {
  day: DailyEnergyMix
  label: string
}

export function EnergyPieChart({ day, label }: EnergyPieChartProps) {
  const chartData: ChartDataPoint[] = FUEL_ORDER.map((fuel) => ({
    fuel,
    name: FUEL_LABELS[fuel],
    value: day.sources[fuel],
  })).filter((item) => item.value > 0)

  return (
    <article className="energy-card">
      <div className="energy-card__header">
        <div>
          <h2>{label}</h2>
          <p>{formatDate(day.date)}</p>
        </div>
      </div>

      <div className="chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="86%"
              paddingAngle={2}
              stroke="var(--surface-card)"
              strokeWidth={3}
            >
              {chartData.map((entry) => (
                <Cell key={entry.fuel} fill={FUEL_COLORS[entry.fuel]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatPercent(Number(value))}
              contentStyle={{
                border: '1px solid var(--outline-variant)',
                borderRadius: 8,
                boxShadow: 'var(--shadow)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-center">
          <span>Clean</span>
          <strong>{formatPercent(day.cleanEnergyPercentage)}</strong>
        </div>
      </div>

      <div className="breakdown-title">Generation Breakdown</div>
      <ul className="fuel-list" aria-label={`Energy mix ${day.date}`}>
        {chartData.map((entry) => (
          <li key={entry.fuel}>
            <span
              className="fuel-dot"
              style={{ backgroundColor: FUEL_COLORS[entry.fuel] }}
            />
            <span>{entry.name}</span>
            <strong>{formatPercent(entry.value)}</strong>
          </li>
        ))}
      </ul>
    </article>
  )
}
