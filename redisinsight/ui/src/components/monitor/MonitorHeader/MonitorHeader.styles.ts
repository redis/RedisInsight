import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Row)`
  height: 34px;
  line-height: 34px;
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  padding: 0 10px 0 16px;
  z-index: 10;

  .transparent button {
    cursor: default;
  }
`

export const Title = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .euiIcon {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.icon.primary500};
    margin-right: 8px;
  }
`

export const Actions = styled.div`
  width: 82px;
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  margin-left: 12px;
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  border-right: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
`

export const ProfilerOnboardPanel = styled.div`
  margin-top: -4px;
`
