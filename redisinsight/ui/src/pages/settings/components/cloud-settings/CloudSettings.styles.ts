import styled from 'styled-components'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled.div``

export const SectionTitle = styled(Title)`
  font-size: 16px;
`

export const SmallText = styled(Text).attrs({
  size: 'm',
  color: 'primary',
})``

export const PopoverDeleteContainer = styled.div``

export const PopoverFooter = styled(Row).attrs({
  justify: 'end',
})``
