import type { FuelType } from '../types/energy'

export const FUEL_LABELS: Record<FuelType, string> = {
  biomass: 'Biomass',
  coal: 'Coal',
  imports: 'Import',
  gas: 'Gas',
  nuclear: 'Nuclear',
  other: 'Other',
  hydro: 'Hydro',
  solar: 'Solar',
  wind: 'Wind',
}

export const FUEL_COLORS: Record<FuelType, string> = {
  biomass: '#8b5cf6',
  coal: '#1f2937',
  imports: '#f97316',
  gas: '#ef4444',
  nuclear: '#2563eb',
  other: '#94a3b8',
  hydro: '#0891b2',
  solar: '#eab308',
  wind: '#16a34a',
}

export const FUEL_ORDER: FuelType[] = [
  'wind',
  'solar',
  'nuclear',
  'hydro',
  'biomass',
  'gas',
  'imports',
  'coal',
  'other',
]
