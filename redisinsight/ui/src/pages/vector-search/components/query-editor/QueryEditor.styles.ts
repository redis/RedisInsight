import styled from 'styled-components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'

export const EditorWrapper = styled(FlexGroup)`
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`

export const ToggleBar = styled(FlexGroup)`
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space200};
  flex-shrink: 0;
`

export const EditorContainer = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`

export const ActionsBar = styled(FlexGroup)`
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  border-top: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
`
