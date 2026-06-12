export type FuelType =
  | 'biomass'
  | 'coal'
  | 'imports'
  | 'gas'
  | 'nuclear'
  | 'other'
  | 'hydro'
  | 'solar'
  | 'wind'

export type EnergySources = Record<FuelType, number>

export interface DailyEnergyMix {
  date: string
  sources: EnergySources
  cleanEnergyPercentage: number
  intervalCount: number
}

export interface ChargingWindowResult {
  start: string
  end: string
  cleanEnergyPercentage: number
}
