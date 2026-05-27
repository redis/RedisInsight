import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  position: relative;
  width: 100%;
  height: 100%;
`

export const DetailsBody = styled(Col)`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

export const ListWrapper = styled(Col)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`
