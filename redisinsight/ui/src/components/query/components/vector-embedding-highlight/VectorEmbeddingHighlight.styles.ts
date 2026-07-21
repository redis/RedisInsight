import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const VectorEmbeddingHighlightStyles = createGlobalStyle<{
  theme: Theme
}>`
  .monaco-vector-embedding {
    background-color: ${({ theme }) => theme.semantic.color.background.neutral400};
    border-radius: ${({ theme }) => theme.core.space.space050};
  }

  /* Bracket/id delimiters of a collapsed embedding placeholder: present in
     the text (they make the placeholder identifiable) but not shown.
     font-size: 0 rather than display: none — the spans must stay in the
     layout (at zero width) so Monaco can still measure cursor positions
     inside them; with display: none the cursor becomes invisible there. */
  .monaco-vector-embedding-hidden {
    font-size: 0;
  }

  /* Clickable toggle (label or arrow) injected to the left of a detected
     embedding. Styled like an inlay-hint chip — rounded, tinted and slightly
     smaller than the code — so it reads as editor UI, not query text. Only
     horizontal padding: vertical padding would overflow Monaco's fixed line
     height, the reduced font size provides the vertical inset instead. */
  .monaco-vector-embedding-toggle {
    cursor: pointer;
    color: ${({ theme }) => theme.semantic.color.text.informative400};
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral400};
    border-radius: ${({ theme }) => theme.core.space.space100};
    padding: 0 ${({ theme }) => theme.core.space.space100};
    margin-right: ${({ theme }) => theme.core.space.space100};
    font-size: 1.2rem;
  }
`
