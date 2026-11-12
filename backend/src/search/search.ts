// Turns the text typed by a person into a pattern for ILIKE: "pass" becomes "%pass%".
// The characters that have a special meaning in LIKE (% _ \) are escaped, so they are searched as plain text.
// Returns null when there is nothing to search for, then the filter is not applied.
export function toSearchPattern(search: string | undefined): string | null {
  const text = search?.trim() ?? ''
  if (text === '') {
    return null
  }
  return '%' + text.replace(/[\\%_]/g, (character) => '\\' + character) + '%'
}
