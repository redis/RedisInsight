import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ComposedInput } from 'uiSrc/components/base/inputs'

export const ResultPanel = styled(Col)`
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.core.space.space150};
  overflow: auto;
`

export const ResultField = styled(FormField)``

export const ResultInput = styled(ComposedInput)``

export const ErrorText = styled(Text)`
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`
