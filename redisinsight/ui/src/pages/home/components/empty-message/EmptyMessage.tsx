import React from 'react'

import CakeIcon from 'uiSrc/assets/img/databases/cake.svg'

import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'

import * as S from './EmptyMessage.styles'

export interface Props {
  onAddInstanceClick: () => void
}

const EmptyMessage = ({ onAddInstanceClick }: Props) => (
  <S.Container data-testid="empty-database-instance-list">
    <S.Icon src={CakeIcon} alt="empty" />
    <S.MessageText>No databases yet, let&apos;s add one!</S.MessageText>
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
          underline
          data-testid="empty-database-cloud-button"
          target="_blank"
          href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
            campaign: UTM_CAMPAINGS[OAuthSocialSource.EmptyDatabasesList],
            medium: 'main',
          })}
          onClick={(e) => {
            ssoCloudHandlerClick(e as any, {
              action: OAuthSocialAction.Create,
              source: OAuthSocialSource.EmptyDatabasesList,
            })
          }}
        >
          Create a free Redis Cloud database
        </Link>
      )}
    </OAuthSsoHandlerDialog>
  </S.Container>
)

export default EmptyMessage
