import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  height: 34px;
  line-height: 34px;
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  padding: 0 10px 0 16px;
  z-index: 10;
`

export const Icon = styled.span`
  margin-left: 5px;
`

export const EndpointContainer = styled.span`
  cursor: default;
  font:
    normal normal normal 12px/15px Graphik,
    sans-serif;
  letter-spacing: -0.12px;
  max-width: 210px;
  display: inline-flex;
  padding-right: 10px;
`

export const Endpoint = styled.span`
  font:
    normal normal normal 12px/15px Graphik,
    sans-serif;
  letter-spacing: -0.12px;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-left: 5px;
`

export const Title = styled.div`
  align-items: center;
  .euiIcon {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.icon.primary500};
    margin-right: 8px;
  }
`

export const CliOnboardPanel = styled.div`
  margin-top: -4px;
`
