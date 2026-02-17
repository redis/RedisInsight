import styled from 'styled-components'

import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const KeysBrowserRoot = styled(Col)`
  height: 100%;
`

export const KeysBrowserHeaderContainer = styled(Row)`
  width: 100%;
  padding: ${({ theme }) =>
    `${theme.core.space.space050} ${theme.core.space.space150}`};
  flex-shrink: 0;
  position: relative;
`

export const KeysBrowserContentContainer = styled(Col)`
  overflow: hidden;
`

export const KeysBrowserFooterContainer = styled(Row)`
  flex-shrink: 0;
  padding: ${({ theme }) =>
    `${theme.core.space.space050} ${theme.core.space.space150}`};
`
