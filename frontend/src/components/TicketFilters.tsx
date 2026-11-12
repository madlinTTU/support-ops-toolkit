import { TICKET_CATEGORIES, TICKET_STATUSES } from '@/api/types'
import type { TicketFilters as Filters } from '@/api/types'
import { FilterSelect } from '@/components/FilterSelect'

interface TicketFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  return (
    <>
      <FilterSelect
        label="Status"
        value={filters.status}
        options={TICKET_STATUSES}
        onChange={(status) => onChange({ ...filters, status })}
      />
      <FilterSelect
        label="Category"
        value={filters.category}
        options={TICKET_CATEGORIES}
        onChange={(category) => onChange({ ...filters, category })}
      />
    </>
  )
}
