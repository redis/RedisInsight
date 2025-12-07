export type ToggleAnalyticsReasonType =
  | 'none'
  | 'oauth-agreement'
  | 'google'
  | 'github'
  | 'sso'
  | 'user';

export enum ToggleAnalyticsReason {
  None = 'none',
  OAuthAgreement = 'oauth-agreement',
  Google = 'google',
  Github = 'github',
  Sso = 'sso',
  User = 'user',
}
