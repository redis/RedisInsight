export interface WelcomeScreenProps {
  /**
   * Callback when "Try with sample data" button is clicked.
   */
  onTrySampleDataClick?: () => void

  /**
   * Callback when "Create index" button is clicked.
   */
  onUseMyDatabaseClick?: () => void

  /**
   * Overrides the "use my database" button label. Used by the legacy
   * (pre dev-vs-enhancements) flow to show "Use data from my database".
   */
  useMyDatabaseText?: string

  /**
   * Disable the "use my database" button and show a tooltip.
   * Used by the legacy (pre dev-vs-enhancements) flow when the database
   * has no indexable keys. Tooltip text is required when disabled.
   */
  useMyDatabaseDisabled?: {
    tooltip: string
  }
}

export interface Feature {
  icon: string
  title: string
  description: string
}
