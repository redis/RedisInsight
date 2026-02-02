import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  display: flex;
  align-items: center;
`

export const Title = styled.span`
  margin-right: 8px;

  @media (max-width: 1280px) {
    .insights-open & {
      display: none;
    }
  }
`

export const TutorialLink = styled.a`
  padding: 4px 8px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  border-radius: 4px;
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
  text-decoration: none;
  font-size: 12px;

  &:not(:first-of-type) {
    margin-left: 8px;
  }

  &:hover,
  &:focus {
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.primary};
    text-decoration: underline;
    outline: none;
    animation: none;
  }
`
