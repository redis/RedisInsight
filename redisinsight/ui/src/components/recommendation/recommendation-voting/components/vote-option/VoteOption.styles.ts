import styled from 'styled-components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const PopoverWrapper = styled.div``

export const PetardIcon = styled.span`
  width: 20px;
  height: 18px;
  margin-right: 4px;
`

export const VotingText = styled.span`
  font:
    normal normal normal 12px/14px Graphik,
    sans-serif;
`

export const CloseBtn = styled(IconButton)`
  width: 14px;
  height: 14px;
  margin-left: 4px;
`

export const GitHubLink = styled(Link)`
  padding: 4px 8px 4px 4px;
  margin-top: 10px;
  height: 22px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.button.variants.primary.normal?.bgColor};
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.button.variants.primary.normal?.textColor};

  &:hover {
    text-decoration: none;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.components.button.variants.primary.hover?.bgColor};
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.button.variants.primary.normal?.textColor};
  }

  & > span {
    display: flex;
    gap: 4px;
    align-items: center;
  }
`

export const GithubIcon = styled.span`
  margin-right: 2px;
`

export const VotingIconButton = styled(IconButton)`
  width: 28px;
  height: 28px;
  border-radius: 50%;
`
