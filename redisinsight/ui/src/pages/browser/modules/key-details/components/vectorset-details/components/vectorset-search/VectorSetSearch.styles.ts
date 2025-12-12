import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

export const SearchInputWrapper = styled.div`
  flex: 1;
  min-width: 200px;
`

export const VectorInput = styled.div`
  flex: 2;
  min-width: 300px;
`

export const CountInput = styled.div`
  width: 80px;
`
