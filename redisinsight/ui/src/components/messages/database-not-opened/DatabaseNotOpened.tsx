import React from 'react'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text, Title } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link'
import { OAuthSsoHandlerDialog } from 'uiSrc/components/oauth'

import * as S from './DatabaseNotOpened.styles'

export interface Props {
  source?: OAuthSocialSource
  onClose?: () => void
}

const DatabaseNotOpened = (props: Props) => {
  const { source = OAuthSocialSource.Tutorials, onClose } = props

  return (
    <Row data-testid="database-not-opened-popover">
      <Col>
        <Title size="S">Open a database</Title>
        <Spacer size="s" />
        <Col>
          <Text size="s">
            Open your Redis database, or create a new database to get started.
          </Text>
          <Spacer size="m" />
          <OAuthSsoHandlerDialog>
            {(ssoCloudHandlerClick) => (
              <Link
                external
                target="_blank"
                variant="inline"
                href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                  campaign: UTM_CAMPAINGS[source] ?? source,
                })}
                onClick={(e: React.MouseEvent) => {
                  ssoCloudHandlerClick(e, {
                    source,
                    action: OAuthSocialAction.Create,
                  })
                  onClose?.()
                }}
                data-testid="tutorials-get-started-link"
              >
                Create a free Redis Cloud database
              </Link>
            )}
          </OAuthSsoHandlerDialog>
          <Spacer size="xs" />
          <Link
            external
            target="_blank"
            variant="inline"
            href={getUtmExternalLink(EXTERNAL_LINKS.docker, {
              campaign: UTM_CAMPAINGS[source] ?? source,
            })}
            data-testid="tutorials-docker-link"
          >
            Install using Docker
          </Link>
        </Col>
      </Col>
      <S.ImgWrapper>
        <img src={TelescopeImg} alt="telescope" loading="lazy" />
      </S.ImgWrapper>
    </Row>
  )
}

export default DatabaseNotOpened
