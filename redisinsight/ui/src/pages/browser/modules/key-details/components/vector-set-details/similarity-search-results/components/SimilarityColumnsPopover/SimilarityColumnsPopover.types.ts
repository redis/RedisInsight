export interface Props {
  /** Container width (px) — drives the icon-only / icon-and-label switch. */
  width: number
  /** Toggleable columns only (`columnId → label`). */
  columnsMap: Map<string, string>
  /** Currently-visible column ids (includes Element + Similarity anchors). */
  shownColumns: string[]
  onShownColumnsChange: (next: string[]) => void
  /** Override the trigger label / tooltip / aria-label. */
  title?: string
}
