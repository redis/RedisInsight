import React from 'react'
import { isArray, isString } from 'lodash'
import { OAuthSsoHandlerDialog, OAuthConnectFreeDb } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { replaceVariables } from 'uiSrc/utils/recommendation'
import { IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { UTM_MEDIUMS } from 'uiSrc/constants/links'
import { Spacer, SpacerSize } from 'uiSrc/components/base/layout/spacer'
import { ColorText } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import InternalLink from '../internal-link'
import RecommendationBody from '../recommendation-body'

import * as S from '../Recommendation.styles'

export interface Props {
  content: IRecommendationContent
  telemetryName: string
  params?: any
  onLinkClick?: () => void
  insights?: boolean
  idx: number
}

const ContentElement = (props: Props) => {
  const {
    content = {},
    params,
    onLinkClick,
    telemetryName,
    insights,
    idx,
  } = props
  const { type, value, parameter } = content

  const replacedValue = replaceVariables(value, parameter, params)

  switch (type) {
    case 'paragraph':
      return (
        <S.Text
          as={ColorText}
          size="M"
          data-testid={`paragraph-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          component="div"
          $insights={insights}
          color="primary"
        >
          {value}
        </S.Text>
      )
    case 'code':
      return (
        <S.Code
          as={ColorText}
          size="M"
          data-testid={`code-${telemetryName}-${idx}`}
          $insights={insights}
          key={`${telemetryName}-${idx}`}
          color="primary"
        >
          <S.Text as="code" $insights={insights}>
            {value}
          </S.Text>
        </S.Code>
      )
    case 'span':
      return (
        <S.Text
          as={ColorText}
          size="M"
          data-testid={`span-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          color="primary"
          $insights={insights}
        >
          {value}
        </S.Text>
      )
    case 'link':
      return (
        <Link
          color="subdued"
          key={`${telemetryName}-${idx}`}
          data-testid={`link-${telemetryName}-${idx}`}
          target="_blank"
          variant="inline"
          size="M"
          href={getUtmExternalLink(value.href, {
            medium: UTM_MEDIUMS.Recommendation,
            campaign: telemetryName,
          })}
          onClick={() => onLinkClick?.()}
        >
          {value.name}
        </Link>
      )
    case 'link-sso':
      return (
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <Link
              key={`${telemetryName}-${idx}`}
              data-testid={`link-sso-${telemetryName}-${idx}`}
              target="_blank"
              variant="inline"
              size="M"
              onClick={(e) => {
                ssoCloudHandlerClick?.(e, {
                  source: telemetryName as OAuthSocialSource,
                  action: OAuthSocialAction.Create,
                })
              }}
              href={getUtmExternalLink(value.href, {
                medium: UTM_MEDIUMS.Recommendation,
                campaign: telemetryName,
              })}
            >
              {value.name}
            </Link>
          )}
        </OAuthSsoHandlerDialog>
      )
    case 'connect-btn':
      return <OAuthConnectFreeDb source={telemetryName as OAuthSocialSource} />
    case 'code-link':
      return (
        <Link
          key={`${telemetryName}-${idx}`}
          data-testid={`code-link-${telemetryName}-${idx}`}
          target="_blank"
          variant="inline"
          size="M"
          href={getUtmExternalLink(value.href, {
            medium: UTM_MEDIUMS.Recommendation,
            campaign: telemetryName,
          })}
        >
          <S.Code as={ColorText} $insights={insights} color="subdued">
            <S.Text as="code" $insights={insights}>
              {value.name}
            </S.Text>
          </S.Code>
        </Link>
      )
    case 'spacer':
      return (
        <Spacer
          data-testid={`spacer-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          size={value as SpacerSize}
        />
      )
    case 'list':
      return (
        <S.List
          data-testid={`list-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
        >
          {isArray(value) &&
            value.map((listElement: IRecommendationContent[], idx: number) => (
              <S.ListItem
                $insights={insights}
                // eslint-disable-next-line react/no-array-index-key
                key={`list-item-${idx}`}
              >
                <RecommendationBody
                  elements={listElement}
                  params={params}
                  telemetryName={telemetryName}
                  onLinkClick={onLinkClick}
                  insights={insights}
                />
              </S.ListItem>
            ))}
        </S.List>
      )
    case 'internal-link':
      return (
        <InternalLink
          key={`${telemetryName}-${idx}`}
          dataTestid={`internal-link-${telemetryName}-${idx}`}
          path={replacedValue.path}
          text={replacedValue.name}
        />
      )
    default:
      return isString(value) ? <>{value}</> : <b>*Unknown format*</b>
  }
}

export default ContentElement
