export interface AzureSignInDialogProps {
  isOpen: boolean
  loading?: boolean
  onClose: () => void
  /**
   * Called when the user confirms sign-in. `tenantId` is the optional tenant
   * (GUID or domain) entered under Advanced options, or undefined for the
   * default home-tenant sign-in.
   */
  onSignIn: (tenantId?: string) => void
}
