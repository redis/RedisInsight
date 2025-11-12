import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import { theme } from '@redis-ui/styles'

export const StyledContainer = styled(Col)<{ $isCluster?: boolean }>`
  width: ${({ $isCluster }) => ($isCluster ? '394px' : '550px')};
  padding: ${theme.core.space.space200};
  border-radius: ${theme.core.space.space050};
`

export const StyledInput = styled(TextInput)`
  width: 160px;
`
