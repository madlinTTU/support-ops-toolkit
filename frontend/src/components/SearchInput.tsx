interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label="Search"
      maxLength={100}
      className="w-64 rounded-md border border-line bg-surface px-3 py-1.5 text-sm placeholder:text-muted"
    />
  )
}
