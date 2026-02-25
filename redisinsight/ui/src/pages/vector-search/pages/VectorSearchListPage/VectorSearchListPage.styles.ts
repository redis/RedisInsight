import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const HeaderRow = styled(Row).attrs({ grow: false })`
  align-items: center;
`

export const PageLayout = styled(Col).attrs({ gap: 'l' })`
  min-height: 0;
`
