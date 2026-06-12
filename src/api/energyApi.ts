import type { ChargingWindowResult, DailyEnergyMix } from '../types/energy'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`
    let message: string

    try {
      const body = (await response.json()) as { message?: string }
      message = body.message ?? fallbackMessage
    } catch {
      message = fallbackMessage
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export function fetchDailyEnergyMix(): Promise<DailyEnergyMix[]> {
  return request<DailyEnergyMix[]>('/api/energy-mix')
}

export function fetchBestChargingWindow(
  hours: number,
): Promise<ChargingWindowResult> {
  return request<ChargingWindowResult>(`/api/charging-window?hours=${hours}`)
}
