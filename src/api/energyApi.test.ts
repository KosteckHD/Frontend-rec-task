import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchBestChargingWindow, fetchDailyEnergyMix } from './energyApi'
import type { ChargingWindowResult, DailyEnergyMix } from '../types/energy'

describe('energyApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches daily energy mix from the backend API', async () => {
    const energyMix: DailyEnergyMix[] = [
      {
        date: '2026-06-12',
        cleanEnergyPercentage: 72.5,
        intervalCount: 48,
        sources: {
          biomass: 3,
          coal: 0,
          gas: 15,
          hydro: 1,
          imports: 8,
          nuclear: 12,
          other: 1,
          solar: 10,
          wind: 50,
        },
      },
    ]
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(responseWithJson(energyMix))

    await expect(fetchDailyEnergyMix()).resolves.toEqual(energyMix)
    expect(fetchMock).toHaveBeenCalledWith('/api/energy-mix')
  })

  it('fetches the best charging window using the selected hours', async () => {
    const chargingWindow: ChargingWindowResult = {
      start: '2026-06-13T11:30:00Z',
      end: '2026-06-13T14:30:00Z',
      cleanEnergyPercentage: 89,
    }
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(responseWithJson(chargingWindow))

    await expect(fetchBestChargingWindow(3)).resolves.toEqual(chargingWindow)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/charging-window?hours=3',
    )
  })

  it('uses backend error messages when requests fail', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      responseWithJson({ message: 'hours must be an integer between 1 and 6' }, 400),
    )

    await expect(fetchBestChargingWindow(7)).rejects.toThrow(
      'hours must be an integer between 1 and 6',
    )
  })
})

function responseWithJson(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response
}
