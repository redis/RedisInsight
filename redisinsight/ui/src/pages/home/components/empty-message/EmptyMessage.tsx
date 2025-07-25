import React from 'react'

import CakeIcon from 'uiSrc/assets/img/databases/cake.svg'

import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import styles from './styles.module.scss'

export interface Props {
  onAddInstanceClick: () => void
}

const EmptyMessage = ({ onAddInstanceClick }: Props) => (
  <div
    className={styles.noResultsContainer}
    data-testid="empty-database-instance-list"
  >
    <img src={CakeIcon} className={styles.icon} alt="empty" />
    <Text className={styles.text}>No databases yet, let&apos;s add one!</Text>
    <PrimaryButton
      size="m"
      onClick={() => {
        sendEventTelemetry({
          event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
          eventData: {
            source: OAuthSocialSource.EmptyDatabasesList,
          },
        })
        onAddInstanceClick?.()
      }}
      data-testid="empty-rdi-instance-button"
    >
      + Add Redis database
    </PrimaryButton>
    <OAuthSsoHandlerDialog>
      {(ssoCloudHandlerClick) => (
        <Link
          data-testid="empty-database-cloud-button"
          target="_blank"
          className={styles.link}
          href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
            campaign: UTM_CAMPAINGS[OAuthSocialSource.EmptyDatabasesList],
            medium: 'main',
          })}
          onClick={(e) => {
            ssoCloudHandlerClick(e, {
              action: OAuthSocialAction.Create,
              source: OAuthSocialSource.EmptyDatabasesList,
            })
          }}
        >
          Create a free trial Cloud database
        </Link>
      )}
    </OAuthSsoHandlerDialog>
  </div>
)

export default EmptyMessage
