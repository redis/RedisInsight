import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  width: 612px;
  min-width: 612px;
  padding: 40px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
`

export const Content = styled.section`
  scrollbar-width: thin;
  overflow: auto;
  max-height: 400px;
`

export const Title = styled.div`
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding: 10px 0;
`

export const SubTitle = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
`

export const Radios = styled.div`
  padding-top: 24px;
`

export const Label = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};

  span {
    padding-left: 6px;
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.secondary};
  }
`

export const Footer = styled.div`
  padding-top: 20px;
  text-align: right;
  padding-bottom: 4px;
`

export const Button = styled.span`
  margin-left: 8px;
`
