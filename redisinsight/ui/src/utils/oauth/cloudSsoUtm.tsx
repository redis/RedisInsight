import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'

// Map oauth social source to utm campaign parameter
export const getCloudSsoUtmCampaign = (
  source?: string | null,
): CloudSsoUtmCampaign => {
  switch (source) {
    case OAuthSocialSource.ListOfDatabases:
    case OAuthSocialSource.DatabaseConnectionList:
      return CloudSsoUtmCampaign.ListOfDatabases
    case OAuthSocialSource.BrowserSearch:
      return CloudSsoUtmCampaign.BrowserSearch
    case OAuthSocialSource.RediSearch:
    case OAuthSocialSource.RedisJSON:
    case OAuthSocialSource.RedisTimeSeries:
    case OAuthSocialSource.RedisGraph:
    case OAuthSocialSource.RedisBloom:
      return CloudSsoUtmCampaign.Workbench
    case OAuthSocialSource.BrowserContentMenu:
      return CloudSsoUtmCampaign.BrowserOverview
    case OAuthSocialSource.BrowserFiltering:
      return CloudSsoUtmCampaign.BrowserFilter
    case OAuthSocialSource.WelcomeScreen:
      return CloudSsoUtmCampaign.WelcomeScreen
    case OAuthSocialSource.Tutorials:
      return CloudSsoUtmCampaign.Tutorial
    case OAuthSocialSource.Autodiscovery:
    case OAuthSocialSource.DiscoveryForm:
      return CloudSsoUtmCampaign.AutoDiscovery
    case OAuthSocialSource.AiChat:
      return CloudSsoUtmCampaign.Copilot
    case OAuthSocialSource.UserProfile:
      return CloudSsoUtmCampaign.UserProfile
    case OAuthSocialSource.SettingsPage:
      return CloudSsoUtmCampaign.Settings
    case OAuthSocialSource.NavigationMenu:
      return CloudSsoUtmCampaign.NavigationMenu
    case OAuthSocialSource.AddDbForm:
      return CloudSsoUtmCampaign.AddDbForm
    default:
      return CloudSsoUtmCampaign.Unknown
  }
}

// Create search query utm parameters
export const getCloudSsoUtmParams = (source?: string | null): URLSearchParams =>
  new URLSearchParams([
    ['source', 'redisinsight'],
    ['medium', 'sso'], // todo: distinguish between electron and web?
    ['campaign', getCloudSsoUtmCampaign(source)],
  ])
