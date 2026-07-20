export interface ArrayIndexCellProps {
  /** Decimal-string index (BigInt-as-string contract). */
  index: string
  /** Show a disclosure chevron before the index (expandable Search rows). */
  canExpand?: boolean
  /** Chevron direction: down when the row is expanded, right when collapsed. */
  isExpanded?: boolean
}
