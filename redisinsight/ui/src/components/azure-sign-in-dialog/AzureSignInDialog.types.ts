export interface AzureSignInDialogProps {
  isOpen: boolean
  loading?: boolean
  onClose: () => void
  /**
   * Called when the user confirms sign-in. `tenantId` is the optional tenant
   * (GUID or domain) from the Tenant ID field, or undefined for the default
   * home-tenant sign-in.
   */
  onSignIn: (tenantId?: string) => void
}
