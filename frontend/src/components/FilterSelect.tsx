import { humanize } from '@/lib/format'

interface FilterSelectProps<T extends string> {
  label: string
  value: T | 'all'
  options: readonly T[]
  onChange: (value: T | 'all') => void
}

// A drop-down with "All" and the given options. Used for the filters of both pages.
export function FilterSelect<T extends string>({ label, value, options, onChange }: FilterSelectProps<T>) {
  return (
    <label className="text-sm text-muted">
      {label}
      <select
        className="ml-2 rounded-md border border-line bg-surface px-3 py-1.5 text-ink"
        value={value}
        onChange={(event) => onChange(options.find((option) => option === event.target.value) ?? 'all')}
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {humanize(option)}
          </option>
        ))}
      </select>
    </label>
  )
}
