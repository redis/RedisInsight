import { FeatureFlags } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { HELP_LINKS } from 'uiSrc/pages/home/constants'

import { dispatch, store } from 'uiSrc/slices/store'

const handleClickFreeCloudDb = () => {
  const { [FeatureFlags.cloudSso]: cloudSsoFeature } =
    appFeatureFlagsFeaturesSelector(store.getState())

  if (cloudSsoFeature?.flag) {
    dispatch(setSSOFlow(OAuthSocialAction.Create))
    dispatch(setSocialDialogState(OAuthSocialSource.DatabaseConnectionList))
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: { source: OAuthSocialSource.DatabaseConnectionList },
    })
    return
  }

  sendEventTelemetry({
    event: HELP_LINKS.cloud.event,
    eventData: { source: HELP_LINKS.cloud.sources.databaseConnectionList },
  })

  const link = document.createElement('a')
  link.setAttribute(
    'href',
    getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
      campaign: 'list_of_databases',
    }),
  )
  link.setAttribute('target', '_blank')

  link.click()
  link.remove()
}

export default handleClickFreeCloudDb
