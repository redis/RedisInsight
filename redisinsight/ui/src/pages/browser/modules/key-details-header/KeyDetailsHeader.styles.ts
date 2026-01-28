import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const Container = styled(FlexItem)`
  padding: 18px 18px 12px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.semantic.color.border.default};
  min-width: 100%;
  position: relative;
`

export const KeyFlexGroup = styled(Row)``

export const CloseBtn = styled(IconButton)`
  padding-top: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`

export const GroupSecondLine = styled(Row)`
  margin-top: ${({ theme }) => theme.core.space.space050};
`

export const SubtitleActionBtns = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  right: 13px;
`

export const ActionBtn = styled.div`
  margin-right: ${({ theme }) => theme.core.space.space150};
  position: relative;
  z-index: 2;
`
