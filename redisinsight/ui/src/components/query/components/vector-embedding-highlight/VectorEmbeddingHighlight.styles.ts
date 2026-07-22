import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

import {
  EMBEDDING_COPY_CLASS,
  EMBEDDING_EXPAND_CLASS,
  EMBEDDING_HIDDEN_CLASS,
  EMBEDDING_TOGGLE_CLASS,
} from '../../hooks/useVectorEmbeddingCollapse.constants'

export const VectorEmbeddingHighlightStyles = createGlobalStyle<{
  theme: Theme
}>`
  .monaco-vector-embedding {
    background-color: ${({ theme }) => theme.semantic.color.background.neutral400};
    border-radius: ${({ theme }) => theme.core.space.space050};
  }

  /* font-size: 0 (not display: none) keeps the caret measurable inside it. */
  .${EMBEDDING_HIDDEN_CLASS} {
    font-size: 0;
  }

  .${EMBEDDING_TOGGLE_CLASS},
  .${EMBEDDING_EXPAND_CLASS},
  .${EMBEDDING_COPY_CLASS} {
    cursor: pointer;
    pointer-events: auto;
    background-color: ${({ theme }) =>
      theme.semantic.color.background.primary200};
    border-radius: ${({ theme }) => theme.core.space.space100};
    padding: 0 ${({ theme }) => theme.core.space.space100};
    font-size: 1.2rem;
  }

  .${EMBEDDING_TOGGLE_CLASS}:hover,
  .${EMBEDDING_EXPAND_CLASS}:hover,
  .${EMBEDDING_COPY_CLASS}:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.primary300};
  }

  .${EMBEDDING_TOGGLE_CLASS} {
    margin-right: ${({ theme }) => theme.core.space.space050};
  }

  .${EMBEDDING_COPY_CLASS},
  .${EMBEDDING_EXPAND_CLASS} {
    margin-right: ${({ theme }) => theme.core.space.space100};
  }
`
