import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

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
