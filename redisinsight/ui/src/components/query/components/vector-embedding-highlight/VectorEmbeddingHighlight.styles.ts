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

  /* Collapsed chip: two adjoining injected spans sharing one tinted pill —
     the toggle label (left half) and the copy button (right half). They are
     separate elements so each keeps its own click action, but the matching
     background and split corner radii read as a single chip. The expanded
     state uses a standalone, fully-rounded arrow. Only horizontal padding —
     vertical padding would overflow Monaco's fixed line height, the font size
     provides the vertical inset instead. */
  .monaco-vector-embedding-toggle,
  .monaco-vector-embedding-expand,
  .monaco-vector-embedding-copy {
    cursor: pointer;
    background-color: ${({ theme }) =>
      theme.semantic.color.background.notice200};
    font-size: 1.2rem;
  }

  /* Toggle label: left half of the collapsed pill. */
  .monaco-vector-embedding-toggle {
    border-top-left-radius: ${({ theme }) => theme.core.space.space100};
    border-bottom-left-radius: ${({ theme }) => theme.core.space.space100};
    padding-left: ${({ theme }) => theme.core.space.space100};
    padding-right: ${({ theme }) => theme.core.space.space050};
  }

  /* Copy button: right half of the collapsed pill. */
  .monaco-vector-embedding-copy {
    color: ${({ theme }) => theme.semantic.color.text.informative400};
    border-top-right-radius: ${({ theme }) => theme.core.space.space100};
    border-bottom-right-radius: ${({ theme }) => theme.core.space.space100};
    padding-left: ${({ theme }) => theme.core.space.space050};
    padding-right: ${({ theme }) => theme.core.space.space100};
    margin-right: ${({ theme }) => theme.core.space.space100};
  }

  /* Expanded state: standalone, fully-rounded collapse arrow. */
  .monaco-vector-embedding-expand {
    border-radius: ${({ theme }) => theme.core.space.space100};
    padding: 0 ${({ theme }) => theme.core.space.space100};
    margin-right: ${({ theme }) => theme.core.space.space100};
  }
`
