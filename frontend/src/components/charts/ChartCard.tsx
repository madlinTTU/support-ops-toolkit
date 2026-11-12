import type { UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { AsyncContent } from '@/components/AsyncContent'
import { BUTTON_SECONDARY } from '@/lib/styles'

export interface TableData {
  headers: string[]
  rows: string[][]
}

interface ChartCardProps<T> {
  title: string
  subtitle: string
  query: UseQueryResult<T[], Error>
  emptyMessage: string
  isEmpty?: (data: T[]) => boolean
  toTable: (data: T[]) => TableData
  children: (data: T[]) => ReactNode
}

function DataTable({ table }: { table: TableData }) {
  return (
    <table className="w-full text-sm">
      <thead className="border-b border-line">
        <tr>
          {table.headers.map((header) => (
            <th key={header} className="px-2 py-2 text-left font-medium text-muted">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {table.rows.map((row) => (
          <tr key={row.join('|')}>
            {row.map((cell, index) => (
              <td key={table.headers[index]} className="px-2 py-1.5">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// A card with a title that says what is measured and for which period, the chart, and a table with the same numbers.
export function ChartCard<T>({ title, subtitle, query, emptyMessage, isEmpty, toTable, children }: ChartCardProps<T>) {
  const [showTable, setShowTable] = useState(false)
  const data = query.data
  const empty = data !== undefined && (isEmpty === undefined ? data.length === 0 : isEmpty(data))

  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        {data !== undefined && !empty && (
          <button type="button" className={BUTTON_SECONDARY} onClick={() => setShowTable(!showTable)}>
            {showTable ? 'Show chart' : 'Show table'}
          </button>
        )}
      </header>
      <div className={`h-72 ${query.isFetching && !query.isPending ? 'opacity-60' : ''}`}>
        <AsyncContent
          bare
          isPending={query.isPending}
          error={query.error}
          isEmpty={empty}
          emptyMessage={emptyMessage}
          onRetry={() => void query.refetch()}
        >
          {data !== undefined &&
            (showTable ? (
              <div className="h-full overflow-auto">{<DataTable table={toTable(data)} />}</div>
            ) : (
              children(data)
            ))}
        </AsyncContent>
      </div>
    </section>
  )
}
