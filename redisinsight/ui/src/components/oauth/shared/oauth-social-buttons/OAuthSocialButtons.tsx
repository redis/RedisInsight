import React from 'react'
import { useSelector } from 'react-redux'
import { oauthCloudPAgreementSelector } from 'uiSrc/slices/oauth/cloud'
import { OAuthStrategy } from 'uiSrc/slices/interfaces'

import { FlexGroup, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { StyledSocialButton } from './OAuthSocialButtons.styles'

export interface Props {
  onClick: (authStrategy: OAuthStrategy) => void
  className?: string
  inline?: boolean
  disabled?: boolean
}

const socialLinks = [
  {
    text: 'Google',
    icon: 'GoogleSigninIcon',
    label: 'google-oauth',
    strategy: OAuthStrategy.Google,
  },
  {
    text: 'Github',
    icon: 'GithubIcon',
    label: 'github-oauth',
    strategy: OAuthStrategy.GitHub,
  },
  {
    text: 'SSO',
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
      className={className}
      data-testid="oauth-container-social-buttons"
    >
      {socialLinks.map(({ strategy, text, icon, label }) => (
        <RiTooltip
          key={label}
          position="top"
          anchorClassName={!agreement ? 'euiToolTip__btn-disabled' : ''}
          content={agreement ? null : 'Acknowledge the agreement'}
          data-testid={`${label}-tooltip`}
        >
          <StyledSocialButton
            variant="primary-inline"
            disabled={!agreement || disabled}
            $inline={inline}
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
              gap="m"
            >
              <RiIcon type={icon as AllIconsType} />
              <Text color="primary">{text}</Text>
            </FlexGroup>
          </StyledSocialButton>
        </RiTooltip>
      ))}
    </Row>
  )
}

export default OAuthSocialButtons
