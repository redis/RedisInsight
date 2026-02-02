import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

// oauth-sign-in-button
export const SignInBtn = styled.button`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral400};
  border-radius: 16px;

  .euiButton__text {
    display: flex;
    align-items: center;
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral600};
  }

  &:hover,
  &:focus {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
  }
`

export const SignInLogo = styled.span`
  width: 14px;
  margin-right: 6px;
`

// oauth-agreement
export const AgreementWrapper = styled.div<{ $small?: boolean }>`
  ${({ $small }) =>
    $small
      ? css`
          ul {
            list-style: initial;
            padding-left: 18px;
            margin-top: 2px;
          }
        `
      : css`
          ul {
            list-style: initial;
            padding-left: 24px;
            margin-top: 4px;
          }
        `}
`

export const AgreementList = styled.ul`
  list-style: initial;
  padding-left: 24px;
  margin-top: 4px;
`

export const AgreementListItem = styled.li``

// oauth-advantages
export const AdvantagesContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const Advantage = styled.div`
  display: flex;
  margin-top: 12px;
  align-items: center;
`

export const AdvantageIcon = styled.span`
  margin-right: 6px;
`

// oauth-sso shared
export const SsoContainer = styled.div`
  height: 100%;
  display: flex;
`

export const SsoAdvantagesContainer = styled.div`
  max-width: 320px;
  padding: 0;
`

export const SsoSocialContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 108px 0px 40px 40px;
`

export const SsoSubTitle = styled.span`
  font-size: 16px;
`

export const SsoTitle = styled.span`
  font-weight: bold;
  text-align: center;
`

export const SsoSocialButtons = styled.div`
  margin: 40px 0 60px;
`

// oauth-connect-free-db
export const ConnectBtn = styled.button`
  position: relative;
`

// oauth-user-profile
export const ProfileWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
`

export const Loading = styled.span`
  border-top-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
`

// oauth-sso-dialog
export const SsoModal = styled.div<{
  $isCreateDb?: boolean
  $isSignIn?: boolean
  $isImport?: boolean
}>`
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  min-width: 768px;
  min-height: 472px;
  padding: 0;

  .euiModalBody__overflow {
    mask-image: none;
  }

  ${({ $isCreateDb, $isImport }) =>
    ($isCreateDb || $isImport) &&
    css`
      max-width: 768px;
      min-height: 500px;
    `}
`
