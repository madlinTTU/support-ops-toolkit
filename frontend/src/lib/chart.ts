// Colours are CSS variables (see index.css), so the charts follow the light and dark theme of the page.
export const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'] as const

const TEXT = { fill: 'var(--color-muted)', fontSize: 12 }

// Hairline axes and grid, recessive. No tick marks.
export const AXIS = {
  tick: TEXT,
  axisLine: { stroke: 'var(--chart-axis)' },
  tickLine: false,
} as const

export const GRID = { stroke: 'var(--chart-grid)' } as const

export function axisLabel(value: string, angle?: number) {
  return {
    value,
    angle,
    position: angle === undefined ? 'insideBottom' : 'insideLeft',
    ...TEXT,
    style: { textAnchor: 'middle' },
  } as const
}

export const SURFACE = 'var(--color-surface)'

export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

// "2026-10-14" becomes "14 Oct".
export function formatDayTick(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// "2026-10-14" becomes "Wed, 14 Oct 2026".
export function formatDayLong(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`
}

// Round tick values for a value axis that starts at zero: 0, 250, 500 ... instead of 0, 650, 1,300 ...
export function niceTicks(max: number): number[] {
  const step = max <= 1500 ? 250 : max <= 3000 ? 500 : 1000
  const top = Math.max(step, Math.ceil(max / step) * step)
  const ticks: number[] = []
  for (let value = 0; value <= top; value += step) {
    ticks.push(value)
  }
  return ticks
}
