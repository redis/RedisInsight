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

  /* Injected chips: the collapsed toggle label, the standalone expanded arrow
     and the copy button beside the collapsed label. Each is its own rounded
     tinted pill. Only horizontal padding — vertical padding would overflow
     Monaco's fixed line height, the font size provides the vertical inset. */
  .monaco-vector-embedding-toggle,
  .monaco-vector-embedding-expand,
  .monaco-vector-embedding-copy {
    cursor: pointer;
    background-color: ${({ theme }) =>
      theme.semantic.color.background.notice200};
    border-radius: ${({ theme }) => theme.core.space.space100};
    padding: 0 ${({ theme }) => theme.core.space.space100};
    font-size: 1.2rem;
  }

  /* Small gap between the toggle label and its copy button. */
  .monaco-vector-embedding-toggle {
    margin-right: ${({ theme }) => theme.core.space.space050};
  }

  .monaco-vector-embedding-copy {
    color: ${({ theme }) => theme.semantic.color.text.informative400};
    margin-right: ${({ theme }) => theme.core.space.space100};
  }

  .monaco-vector-embedding-expand {
    margin-right: ${({ theme }) => theme.core.space.space100};
  }
`
