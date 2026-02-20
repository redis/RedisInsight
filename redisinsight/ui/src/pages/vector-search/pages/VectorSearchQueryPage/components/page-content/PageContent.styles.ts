import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const ContentArea = styled(Row)`
  min-height: 0;
`

export const EditorResultsArea = styled(Col)`
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
`

export const NoResultsWrapper = styled(Col)`
  height: 100%;
  width: 100%;
`
