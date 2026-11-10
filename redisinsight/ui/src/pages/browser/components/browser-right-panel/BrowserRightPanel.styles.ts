import React from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const Content = styled.div<{ children?: React.ReactNode }>`
  position: relative;
  flex: 1;
  min-height: 0;
`
