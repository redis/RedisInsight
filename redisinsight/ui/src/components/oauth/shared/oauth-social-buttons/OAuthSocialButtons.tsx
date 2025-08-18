import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import { RiEmptyButton } from 'uiBase/forms'
import { RiFlexItem } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
import { AllIconsType, RiIcon } from 'uiBase/icons'
import { RiTooltip } from 'uiSrc/components'
import { OAuthStrategy } from 'uiSrc/slices/interfaces'
import { oauthCloudPAgreementSelector } from 'uiSrc/slices/oauth/cloud'
import styles from './styles.module.scss'

export interface Props {
  onClick: (authStrategy: OAuthStrategy) => void
  className?: string
  inline?: boolean
  disabled?: boolean
}

const OAuthSocialButtons = (props: Props) => {
  const { onClick, className, inline, disabled } = props

  const agreement = useSelector(oauthCloudPAgreementSelector)

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

  return (
    <div
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
          <RiEmptyButton
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
            <RiFlexItem direction={inline ? 'row' : 'column'}>
              <RiIcon type={icon as AllIconsType} />
              <RiText className={styles.label}>{text}</RiText>
            </RiFlexItem>
          </RiEmptyButton>
        </RiTooltip>
      ))}
    </div>
  )
}

export default OAuthSocialButtons
