import { OAuthSocialSource } from 'uiSrc/slices/interfaces'

export interface FeatureNotAvailableContent {
  testId: string
  title: string
  description: string
  freeInstanceText: string
  noInstanceText: string
  oauthSource: OAuthSocialSource
}

export interface FeatureNotAvailableProps {
  onClose?: () => void
  content: FeatureNotAvailableContent
}
