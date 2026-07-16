import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const VectorEmbeddingHighlightStyles = createGlobalStyle<{
  theme: Theme
}>`
  .monaco-vector-embedding {
    background-color: ${({ theme }) => theme.semantic.color.background.informative200};
    border-bottom: 1px solid ${({ theme }) => theme.semantic.color.border.informative400};
    border-radius: ${({ theme }) => theme.core.space.space050};
  }
`
