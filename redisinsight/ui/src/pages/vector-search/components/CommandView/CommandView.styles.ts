import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const EditorWrapper = styled(FlexGroup)`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
`

export const CopyButtonWrapper = styled(FlexGroup)`
  position: absolute;
  top: ${({ theme }) => theme.core.space.space100};
  right: ${({ theme }) => theme.core.space.space300};
  gap: ${({ theme }) => theme.core.space.space100};
  z-index: 10;
`
