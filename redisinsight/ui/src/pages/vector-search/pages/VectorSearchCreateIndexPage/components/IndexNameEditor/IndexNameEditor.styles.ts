import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import TextInput from 'uiSrc/components/base/inputs/TextInput'

export const DisplayRow = styled(Row).attrs({
  grow: false,
  align: 'center',
})`
  cursor: pointer;
  gap: ${({ theme }) => theme.core?.space.space050};
`

export const EditRow = styled(Row).attrs({ grow: false })`
  gap: ${({ theme }) => theme.core?.space.space050};
`

export const NameInput = styled(TextInput)`
  width: 200px;
`
