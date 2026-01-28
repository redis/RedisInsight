import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

export const InputWrapper = styled(Row)`
  min-width: 150px;
`

export const FlexWrapper = styled(FlexItem)`
  max-width: 450px;
  gap: ${({ theme }) => theme.core.space.space050};
`

export const KeyInput = styled.div<{ $isEditing?: boolean }>`
  height: 31px;
  flex: 1;
  min-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: ${({ theme }) => theme.core.space.space075};
`
