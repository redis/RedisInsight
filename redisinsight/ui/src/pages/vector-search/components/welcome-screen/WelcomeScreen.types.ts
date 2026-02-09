export interface WelcomeScreenProps {
  /**
   * Callback when "Try with sample data" button is clicked.
   */
  onTrySampleDataClick?: () => void

  /**
   * Callback when "Use data from my database" button is clicked.
   */
  onUseMyDatabaseClick?: () => void

  /**
   * Disable "Use data from my database" button and show tooltip.
   * Tooltip text is required when button is disabled.
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
