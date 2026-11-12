import { useEffect, useState } from 'react'

// Gives the value back only after it stayed the same for delayMs. Used for the search field,
// so the server is asked once after typing and not after every letter.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
