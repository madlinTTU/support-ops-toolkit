// Colours are CSS variables (see index.css), so the charts follow the light and dark theme of the page.
export const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'] as const

const LABEL_TEXT = { fill: 'var(--color-muted)', fontSize: 12 }

// Hairline axes and grid, recessive. No tick marks.
export const AXIS = {
  tick: LABEL_TEXT,
  axisLine: { stroke: 'var(--chart-axis)' },
  tickLine: false,
} as const

export const GRID = { stroke: 'var(--chart-grid)' } as const

// The text above the vertical axis side, turned by 90 degrees: "Tickets", "Minutes".
export function yAxisLabel(text: string) {
  return { value: text, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, ...LABEL_TEXT } as const
}

export function xAxisLabel(text: string) {
  return { value: text, position: 'insideBottom', ...LABEL_TEXT } as const
}

// The look of the tooltip that Recharts draws on hover.
export const TOOLTIP = {
  contentStyle: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-line)',
    borderRadius: 8,
    fontSize: 13,
  },
  labelStyle: { color: 'var(--color-ink)', fontWeight: 500 },
  itemStyle: { color: 'var(--color-ink)' },
} as const

export const SURFACE = 'var(--color-surface)'

// Recharts gives the label and the value of a tooltip as a general type; here they are always text or a number.
export function asText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

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
