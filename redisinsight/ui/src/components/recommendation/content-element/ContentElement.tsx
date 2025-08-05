import React from 'react'
import { isArray, isString } from 'lodash'
import cx from 'classnames'
import { OAuthSsoHandlerDialog, OAuthConnectFreeDb } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { replaceVariables } from 'uiSrc/utils/recommendation'
import { IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { UTM_MEDIUMS } from 'uiSrc/constants/links'
import { RiSpacer, SpacerSize } from 'uiSrc/components/base/layout/spacer'
import { RiColorText } from 'uiSrc/components/base/text'
import { RiLink } from 'uiSrc/components/base/display'
import InternalLink from '../internal-link'
import RecommendationBody from '../recommendation-body'

import styles from '../styles.module.scss'

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
        <RiColorText
          data-testid={`paragraph-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          component="div"
          className={cx(styles.text, { [styles.insights]: insights })}
          color="subdued"
        >
          {value}
        </RiColorText>
      )
    case 'code':
      return (
        <RiColorText
          data-testid={`code-${telemetryName}-${idx}`}
          className={cx(styles.code, { [styles.insights]: insights })}
          key={`${telemetryName}-${idx}`}
          color="subdued"
        >
          <code className={cx(styles.span, styles.text)}>{value}</code>
        </RiColorText>
      )
    case 'span':
      return (
        <RiColorText
          data-testid={`span-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          color="subdued"
          className={cx(styles.span, styles.text, {
            [styles.insights]: insights,
          })}
        >
          {value}
        </RiColorText>
      )
    case 'link':
      return (
        <RiLink
          key={`${telemetryName}-${idx}`}
          data-testid={`link-${telemetryName}-${idx}`}
          target="_blank"
          href={getUtmExternalLink(value.href, {
            medium: UTM_MEDIUMS.Recommendation,
            campaign: telemetryName,
          })}
          onClick={() => onLinkClick?.()}
        >
          {value.name}
        </RiLink>
      )
    case 'link-sso':
      return (
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <RiLink
              key={`${telemetryName}-${idx}`}
              data-testid={`link-sso-${telemetryName}-${idx}`}
              target="_blank"
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
            </RiLink>
          )}
        </OAuthSsoHandlerDialog>
      )
    case 'connect-btn':
      return <OAuthConnectFreeDb source={telemetryName as OAuthSocialSource} />
    case 'code-link':
      return (
        <RiLink
          key={`${telemetryName}-${idx}`}
          data-testid={`code-link-${telemetryName}-${idx}`}
          target="_blank"
          href={getUtmExternalLink(value.href, {
            medium: UTM_MEDIUMS.Recommendation,
            campaign: telemetryName,
          })}
        >
          <RiColorText
            className={cx(styles.code, { [styles.insights]: insights })}
            color="subdued"
          >
            <code className={cx(styles.span, styles.text)}>{value.name}</code>
          </RiColorText>
        </RiLink>
      )
    case 'spacer':
      return (
        <RiSpacer
          data-testid={`spacer-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          size={value as SpacerSize}
        />
      )
    case 'list':
      return (
        <ul
          className={styles.list}
          data-testid={`list-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
        >
          {isArray(value) &&
            value.map((listElement: IRecommendationContent[], idx: number) => (
              <li
                className={cx(styles.listItem, { [styles.insights]: insights })}
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
              </li>
            ))}
        </ul>
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
