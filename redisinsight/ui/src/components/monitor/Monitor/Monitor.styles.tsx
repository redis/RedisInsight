import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

const StyledImagePanel = styled(Col)`
  border: 1px solid #ccc;
  padding: 48px;
  max-width: 420px;
  border-radius: 8px;
`

export const StyledImage = styled.img`
  max-width: 120px;
`

export default StyledImagePanel
