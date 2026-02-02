import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const MonitorLogWrapper = styled.div`
  display: flex;
  min-height: 72px;
  margin: 10px 6px 6px 6px;
  padding: 6px 0;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  box-shadow: 0 3px 15px
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  border-radius: 4px;
  font-family: 'Graphik', sans-serif;
  font-size: 14px;
  letter-spacing: -0.14px;
  overflow: hidden;
`

export const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
`

export const Time = styled.span`
  display: flex;
  align-items: center;

  svg {
    margin-right: 6px;
  }
`

export const Actions = styled.div`
  margin-top: 6px;
`

export const Btn = styled.span`
  height: 36px;
  line-height: 36px;
`
