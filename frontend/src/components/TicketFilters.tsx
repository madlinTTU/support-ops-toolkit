import { TICKET_CATEGORIES, TICKET_STATUSES } from '@/api/types'
import type { TicketCategory, TicketFilters as Filters, TicketStatus } from '@/api/types'
import { humanize } from '@/lib/format'

interface TicketFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const SELECT = 'ml-2 rounded-md border border-line bg-white px-3 py-1.5'

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  return (
    <div className="flex gap-5 text-sm text-muted">
      <label>
        Status
        <select
          className={`${SELECT} text-ink`}
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as TicketStatus | 'all' })}
        >
          <option value="all">All</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {humanize(status)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Category
        <select
          className={`${SELECT} text-ink`}
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value as TicketCategory | 'all' })}
        >
          <option value="all">All</option>
          {TICKET_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {humanize(category)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
