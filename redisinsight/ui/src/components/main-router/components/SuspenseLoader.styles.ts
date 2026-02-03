import styled from 'styled-components'
import { Loader } from 'uiSrc/components/base/display'
import { type Theme } from 'uiSrc/components/base/theme/types'
import { Row } from 'uiSrc/components/base/layout/flex'

export const Cover = styled(Row)`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  opacity: 0.8;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
`

export const StyledLoader = styled(Loader)`
  border-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.border.primary500}
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300}
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300}
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
`
