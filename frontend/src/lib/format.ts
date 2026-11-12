const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24

// 45 becomes "45m", 200 becomes "3h 20m", 3000 becomes "2d 2h".
function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  const minutes = totalMinutes % MINUTES_PER_HOUR
  if (hours === 0) {
    return `${minutes}m`
  }
  if (hours < HOURS_PER_DAY) {
    return `${hours}h ${minutes}m`
  }
  return `${Math.floor(hours / HOURS_PER_DAY)}d ${hours % HOURS_PER_DAY}h`
}

export function formatTimeLeft(minutesLeft: number | null): string {
  if (minutesLeft === null) {
    return '-'
  }
  if (minutesLeft < 0) {
    return `Overdue ${formatDuration(-minutesLeft)}`
  }
  return formatDuration(minutesLeft)
}

export function formatDateTime(iso: string | null): string {
  if (iso === null) {
    return '-'
  }
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

// "account_access" becomes "Account access".
export function humanize(value: string | null): string {
  if (value === null) {
    return '-'
  }
  const text = value.replaceAll('_', ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}
