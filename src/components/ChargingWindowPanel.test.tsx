import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChargingWindowPanel } from './ChargingWindowPanel'
import type { ChargingWindowResult } from '../types/energy'

const chargingResult: ChargingWindowResult = {
  start: '2026-06-13T11:30:00',
  end: '2026-06-13T14:30:00',
  cleanEnergyPercentage: 89,
}

describe('ChargingWindowPanel', () => {
  it('renders the selected charging duration and recommended window details', () => {
    render(
      <ChargingWindowPanel
        hours={3}
        isLoading={false}
        result={chargingResult}
        error={null}
        onHoursChange={vi.fn()}
        onRefresh={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Duration' })).toBeInTheDocument()
    expect(screen.getAllByText('3 h')).toHaveLength(2)
    expect(screen.getByText('Recommended Window')).toBeInTheDocument()
    expect(screen.getByText('89.00% Clean Energy')).toBeInTheDocument()
    expect(screen.getByText('13 Jun 2026, 11:30')).toBeInTheDocument()
    expect(screen.getByText('13 Jun 2026, 14:30')).toBeInTheDocument()
  })

  it('keeps charging duration constrained to full hours between one and six', () => {
    const onHoursChange = vi.fn()

    render(
      <ChargingWindowPanel
        hours={3}
        isLoading={false}
        result={chargingResult}
        error={null}
        onHoursChange={onHoursChange}
        onRefresh={vi.fn()}
      />,
    )

    const durationSlider = screen.getByLabelText('Charging duration')

    expect(durationSlider).toHaveAttribute('min', '1')
    expect(durationSlider).toHaveAttribute('max', '6')
    expect(durationSlider).toHaveAttribute('step', '1')

    fireEvent.change(durationSlider, { target: { value: '5' } })

    expect(onHoursChange).toHaveBeenCalledWith(5)
  })

  it('calls refresh when the user asks to find the optimal window', () => {
    const onRefresh = vi.fn()

    render(
      <ChargingWindowPanel
        hours={2}
        isLoading={false}
        result={chargingResult}
        error={null}
        onHoursChange={vi.fn()}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Find Optimal Window' }))

    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows loading and error states clearly', () => {
    const { rerender } = render(
      <ChargingWindowPanel
        hours={4}
        isLoading
        result={null}
        error={null}
        onHoursChange={vi.fn()}
        onRefresh={vi.fn()}
      />,
    )

    expect(screen.getByText('Calculating optimal window')).toBeInTheDocument()

    rerender(
      <ChargingWindowPanel
        hours={4}
        isLoading={false}
        result={null}
        error="Could not calculate charging window"
        onHoursChange={vi.fn()}
        onRefresh={vi.fn()}
      />,
    )

    expect(screen.getByText('Could not calculate charging window')).toBeInTheDocument()
  })
})
