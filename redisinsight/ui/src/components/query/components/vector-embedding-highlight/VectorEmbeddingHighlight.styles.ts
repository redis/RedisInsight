import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const VectorEmbeddingHighlightStyles = createGlobalStyle<{
  theme: Theme
}>`
  .monaco-vector-embedding {
    background-color: ${({ theme }) => theme.semantic.color.background.neutral400};
    border-radius: ${({ theme }) => theme.core.space.space050};
  }

  /* font-size: 0 (not display: none) keeps the hidden placeholder in the
     layout at zero width, so Monaco can still place the caret inside it. */
  .monaco-vector-embedding-hidden {
    font-size: 0;
  }

  /* Monaco ignores CSS colour on injected text, so the chip label keeps the
     editor's default foreground; primary200 stays readable against it in both
     themes. Only horizontal padding — vertical padding overflows the line. */
  .monaco-vector-embedding-toggle,
  .monaco-vector-embedding-expand,
  .monaco-vector-embedding-copy {
    cursor: pointer;
    /* Injected text is pointer-events: none by default; re-enable for hover. */
    pointer-events: auto;
    background-color: ${({ theme }) =>
      theme.semantic.color.background.primary200};
    border-radius: ${({ theme }) => theme.core.space.space100};
    padding: 0 ${({ theme }) => theme.core.space.space100};
    font-size: 1.2rem;
  }

  .monaco-vector-embedding-toggle:hover,
  .monaco-vector-embedding-expand:hover,
  .monaco-vector-embedding-copy:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.primary300};
  }

  .monaco-vector-embedding-toggle {
    margin-right: ${({ theme }) => theme.core.space.space050};
  }

  .monaco-vector-embedding-copy {
    margin-right: ${({ theme }) => theme.core.space.space100};
  }

  .monaco-vector-embedding-expand {
    margin-right: ${({ theme }) => theme.core.space.space100};
  }
`
