import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Text } from 'uiSrc/components/base/text'

export const Container = styled(Row).attrs({
  align: 'center',
})``

export const InfoIcon = styled(RiIcon).attrs({
  type: 'InfoIcon',
  size: 'l',
})`
  cursor: pointer;
`

export const HeaderSelect = styled(RiSelect)`
  border: 0 none;
`

export const Progress = styled(Text).attrs({
  size: 's',
})`
  display: inline-block;
`

export const TooltipAnchor = styled.span`
  display: inline-flex;
`
