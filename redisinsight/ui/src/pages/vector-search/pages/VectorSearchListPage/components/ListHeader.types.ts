export interface ListHeaderProps {
  /** Current index-name search term */
  search: string
  /** Called with the new term as the user types */
  onSearchChange: (value: string) => void
}
