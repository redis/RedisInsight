import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  padding: 40px 60px;
  text-align: center;
`

export const Title = styled.span`
  font-family: 'Graphik', sans-serif;
  font-size: 28px;
  font-weight: 600;
  word-break: break-word;
  margin-top: 20px;
  margin-bottom: 20px;
`

export const LinksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const Link = styled.a`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  text-decoration: none;
`
