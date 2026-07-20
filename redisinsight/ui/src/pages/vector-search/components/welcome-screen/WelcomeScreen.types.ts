export interface WelcomeScreenProps {
  /**
   * Callback when "Try with sample data" button is clicked.
   */
  onTrySampleDataClick?: () => void

  /**
   * Callback when "Create index" button is clicked.
   */
  onUseMyDatabaseClick?: () => void
}

export interface Feature {
  icon: string
  title: string
  description: string
}
