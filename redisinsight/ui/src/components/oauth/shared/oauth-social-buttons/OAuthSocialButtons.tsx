import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { oauthCloudPAgreementSelector } from 'uiSrc/slices/oauth/cloud'
import { OAuthStrategy } from 'uiSrc/slices/interfaces'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { FlexGroup, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

export interface Props {
  onClick: (authStrategy: OAuthStrategy) => void
  className?: string
  inline?: boolean
  disabled?: boolean
}

const socialLinks = [
  {
    text: 'Google',
    className: styles.googleButton,
    icon: 'GoogleSigninIcon',
    label: 'google-oauth',
    strategy: OAuthStrategy.Google,
  },
  {
    text: 'Github',
    className: styles.githubButton,
    icon: 'GithubIcon',
    label: 'github-oauth',
    strategy: OAuthStrategy.GitHub,
  },
  {
    text: 'SSO',
    className: styles.ssoButton,
    icon: 'SsoIcon',
    label: 'sso-oauth',
    strategy: OAuthStrategy.SSO,
  },
]

const OAuthSocialButtons = (props: Props) => {
  const { onClick, className, inline, disabled } = props

  const agreement = useSelector(oauthCloudPAgreementSelector)

  return (
    <Row
      gap="l"
      align="center"
      justify="between"
      className={cx(styles.container, className)}
      data-testid="oauth-container-social-buttons"
    >
      {socialLinks.map(({ strategy, text, icon, label, className = '' }) => (
        <RiTooltip
          key={label}
          position="top"
          anchorClassName={!agreement ? 'euiToolTip__btn-disabled' : ''}
          content={agreement ? null : 'Acknowledge the agreement'}
          data-testid={`${label}-tooltip`}
        >
          <EmptyButton
            variant="primary-inline"
            disabled={!agreement || disabled}
            className={cx(styles.button, className, {
              [styles.inline]: inline,
            })}
            onClick={() => {
              onClick(strategy)
            }}
            data-testid={label}
            aria-labelledby={label}
          >
            <FlexGroup
              direction={inline ? 'row' : 'column'}
              align="center"
              justify="center"
            >
              <RiIcon type={icon as AllIconsType} />
              <Spacer size="m" />
              <Text className={styles.label}>{text}</Text>
            </FlexGroup>
          </EmptyButton>
        </RiTooltip>
      ))}
    </Row>
  )
}

export default OAuthSocialButtons
