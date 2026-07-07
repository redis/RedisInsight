import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyValueCompressor } from 'uiSrc/constants'
import { formattingBuffer, Nullable } from 'uiSrc/utils'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { ArrayExpandedValueProps } from './ArrayExpandedValue.types'
import * as S from './ArrayExpandedValue.styles'

const TEST_ID_PREFIX = 'array-expanded-value'

/**
 * Full formatted value for an expanded View-tab row. The collapsed cell shows a
 * truncated, compact value; this renders the format's rich, expanded surface —
 * MarkdownViewer for Markdown, an expanded JSON tree for JSON-like formats, and
 * the full wrapped text for the plain formats. Reads `compressor`/`viewFormat`
 * from the same selectors the table cells use, so it stays in sync with them.
 */
export const ArrayExpandedValue = ({
  index,
  value,
}: ArrayExpandedValueProps) => {
  const { compressor = null } = useAppSelector(
    connectedInstanceSelector,
  ) as unknown as { compressor: Nullable<KeyValueCompressor> }
  const { viewFormat } = useAppSelector(selectedKeySelector)

  const { value: decompressed } = decompressingBuffer(value, compressor)
  const { value: formatted } = formattingBuffer(
    decompressed as RedisResponseBuffer,
    viewFormat,
    { expanded: true },
  )

  return (
    <S.Container data-testid={`${TEST_ID_PREFIX}-${index}`}>
      {typeof formatted === 'string' ? (
        <S.PlainText>{formatted}</S.PlainText>
      ) : (
        formatted
      )}
    </S.Container>
  )
}
