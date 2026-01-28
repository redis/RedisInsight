import styled, { css } from 'styled-components'
import { FlexItem, Grid } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { TextInput } from 'uiSrc/components/base/inputs'

export const FlexItemTTL = styled(FlexItem)`
  width: 152px;
  min-width: 152px;
  cursor: pointer;
`

export const TTLGridComponent = styled(Grid)`
  position: relative;
  height: 24px;
  line-height: 24px;
`

export const SubtitleText = styled(Text)`
  padding: 6px 2px 6px 0;
`

export const SubtitleTextTTL = styled(Text)<{ $hidden?: boolean }>`
  height: 26px;
  line-height: 26px;
  padding: 0;

  ${({ $hidden }) =>
    $hidden &&
    css`
      display: none;
    `}
`

export const TTLInput = styled(TextInput)<{ $isEditing?: boolean }>`
  min-width: 106px;
  font-size: 12px;
  height: 24px;
  padding: 2px 0 0 9px;
`

export const TTLTextValue = styled.span`
  padding-left: 14px;
`

export const IconPencil = styled.span``
