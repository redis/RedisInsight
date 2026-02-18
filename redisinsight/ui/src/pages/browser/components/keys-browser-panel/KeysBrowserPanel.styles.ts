import React from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div<{
  children?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}>`
  height: 100%;
  overflow: hidden;
`

export const ErrorContainer = styled(Col)`
  overflow: hidden;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic?.color?.text?.danger500 ?? 'inherit'};
`
