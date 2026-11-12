import { useState } from 'react'
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/lib/styles'

interface CloseTicketFormProps {
  isPending: boolean
  onSubmit: (resolution: string) => void
  onCancel: () => void
}

export function CloseTicketForm({ isPending, onSubmit, onCancel }: CloseTicketFormProps) {
  const [resolution, setResolution] = useState('')
  const canSubmit = resolution.trim() !== '' && !isPending

  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(resolution.trim())
      }}
    >
      <label className="block text-sm font-medium">
        What was done to solve it?
        <textarea
          value={resolution}
          onChange={(event) => setResolution(event.target.value)}
          rows={3}
          placeholder="Write the resolution the customer will get"
          className="mt-1.5 w-full rounded-md border border-line p-2.5 font-normal"
        />
      </label>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={!canSubmit} className={BUTTON_PRIMARY}>
          Close ticket
        </button>
        <button type="button" onClick={onCancel} disabled={isPending} className={BUTTON_SECONDARY}>
          Cancel
        </button>
      </div>
    </form>
  )
}
