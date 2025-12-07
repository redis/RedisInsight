import { getCloudSsoUtmParams } from 'uiSrc/utils/oauth/cloudSsoUtm'
import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'

const getCloudSsoUtmCampaignTestCases = [
  [OAuthSocialSource.ListOfDatabases, CloudSsoUtmCampaign.ListOfDatabases],
  [
    OAuthSocialSource.DatabaseConnectionList,
    CloudSsoUtmCampaign.ListOfDatabases,
  ],
  [OAuthSocialSource.BrowserSearch, CloudSsoUtmCampaign.BrowserSearch],
  [OAuthSocialSource.RediSearch, CloudSsoUtmCampaign.Workbench],
  [OAuthSocialSource.RedisJSON, CloudSsoUtmCampaign.Workbench],
  [OAuthSocialSource.RedisTimeSeries, CloudSsoUtmCampaign.Workbench],
  [OAuthSocialSource.RedisGraph, CloudSsoUtmCampaign.Workbench],
  [OAuthSocialSource.RedisBloom, CloudSsoUtmCampaign.Workbench],
  [OAuthSocialSource.BrowserContentMenu, CloudSsoUtmCampaign.BrowserOverview],
  [OAuthSocialSource.BrowserFiltering, CloudSsoUtmCampaign.BrowserFilter],
  [OAuthSocialSource.WelcomeScreen, CloudSsoUtmCampaign.WelcomeScreen],
  [OAuthSocialSource.Tutorials, CloudSsoUtmCampaign.Tutorial],
  [OAuthSocialSource.Autodiscovery, CloudSsoUtmCampaign.AutoDiscovery],
  [OAuthSocialSource.NavigationMenu, CloudSsoUtmCampaign.NavigationMenu],
  [OAuthSocialSource.AddDbForm, CloudSsoUtmCampaign.AddDbForm],
  [null, CloudSsoUtmCampaign.Unknown],
  [undefined, CloudSsoUtmCampaign.Unknown],
]

describe('getCloudSsoUtmCampaign', () => {
  test.each(getCloudSsoUtmCampaignTestCases)('%j', (input, expected) => {
    expect(getCloudSsoUtmParams(input)).toEqual(
      new URLSearchParams([
        ['source', 'garnetinsight'],
        ['medium', 'sso'],
        ['campaign', expected],
      ]),
    )
  })
})
