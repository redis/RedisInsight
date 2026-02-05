import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Col)`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.globals.body.bgColor};
`

export const StreamDetailsWrapper = styled(Col)`
  height: 100%;
  flex: 1;
`

export const KeyDetailsBody = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: relative;
  height: calc(100% - 144px);
`
