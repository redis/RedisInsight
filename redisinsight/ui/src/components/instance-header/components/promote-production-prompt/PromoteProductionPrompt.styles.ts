import styled from 'styled-components'
import { Card } from 'uiSrc/components/base/layout/card'

// Card has no padding and falls back to a wide default width, so both are set
// here. Positioned fixed in the bottom-right corner.
export const Container = styled(Card)`
  position: fixed;
  right: ${({ theme }) => theme.core.space.space200};
  bottom: ${({ theme }) => theme.core.space.space200};
  z-index: ${({ theme }) => theme.core.zIndex.zIndex5};
  padding: ${({ theme }) => theme.core.space.space200};
  gap: ${({ theme }) => theme.core.space.space150};
`
