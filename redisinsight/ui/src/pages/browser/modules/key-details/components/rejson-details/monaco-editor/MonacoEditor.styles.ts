import styled from 'styled-components'
import { Col, FlexGroup } from 'uiSrc/components/base/layout/flex'

export const EditorContainer = styled(Col)`
  position: relative;
  width: 100%;
  flex-grow: 1;
`

export const CopyButtonWrapper = styled(FlexGroup)`
  position: absolute;
  top: ${({ theme }) => theme.core.space.space100};
  right: ${({ theme }) => theme.core.space.space250};
  z-index: 10;
`
