import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const StyledImagePanel = styled(Col)`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  padding: 48px;
  max-width: 420px;
  border-radius: 8px;
`

export const Container = styled.div<{ $isRunning?: boolean }>`
  height: calc(100% - 34px);
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  text-align: left;
  letter-spacing: 0;
  white-space: pre-line;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  font:
    normal normal normal 14px/17px Inconsolata,
    monospace;
  z-index: 10;
  overflow: auto;
  scrollbar-width: thin;
`

export const Content = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 4px 12px 12px;
`

export const StartContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding-left: 12px;
`

export const StartContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  max-width: 264px;
  flex-direction: column;
  font:
    normal normal normal 12px/18px Graphik,
    sans-serif;
`

export const StartContentError = styled(StartContent)`
  max-width: 298px;
  padding-right: 12px;
`

// MonitorWrapper styles
export const MonitorWrapper = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`

// MonitorOutputList styles
export const ListWrapper = styled.div`
  scrollbar-width: thin;
  height: 100%;
`

export const Item = styled.div`
  display: flex;
  padding: 0 4px;
  font:
    normal normal normal 14px/17px Inconsolata,
    monospace;
`

export const ItemArgs = styled.span<{ $compressed?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  white-space: pre-wrap;

  ${({ $compressed }) =>
    $compressed &&
    `
    flex-wrap: nowrap;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `}
`

export const ItemCommandFirst = styled.span`
  font-weight: bold;
`

export const Time = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  margin-right: 8px;
  white-space: nowrap;
`
