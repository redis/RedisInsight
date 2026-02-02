import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div`
  margin-top: 8px;
`

export const Content = styled.div`
  max-width: 100%;
  max-height: 320px;
  overflow: auto;
  scrollbar-width: thin;
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  border-radius: 4px;
  font-size: 11px;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  word-wrap: break-word;
`

export const Code = styled.div`
  word-wrap: break-word;
`

export const Actions = styled(FlexItem)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`

export const ActionBtn = styled.span`
  display: inline-flex;
`

export const CopyBtn = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`

export const RunBtn = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};
`

export const PopoverAnchor = styled.span`
  display: inline-flex;
`

export const POPOVER_MIN_WIDTH = '372px'

export const PopoverFooter = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

export const ShowAgainCheckBox = styled.div``

export const PopoverBtn = styled.span`
  margin-left: 8px;
  min-width: auto;
`
