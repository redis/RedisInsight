import { OAuthSocialSource } from 'uiSrc/slices/interfaces'

export interface SearchPageFallbackContent {
  testId: string
  title: string
  subtitle?: string
  features?: string[]
  description: string
  ctaText: string
  oauthSource: OAuthSocialSource
  learnMoreLink: string
}
