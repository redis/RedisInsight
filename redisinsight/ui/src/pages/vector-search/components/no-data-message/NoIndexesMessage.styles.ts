import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const StyledContainer = styled(Col)`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  margin: auto;
  max-width: 280px;
  text-align: center;
  align-items: center;
  justify-content: center;
`

export const StyledImage = styled.img`
  max-width: 120px;
`
