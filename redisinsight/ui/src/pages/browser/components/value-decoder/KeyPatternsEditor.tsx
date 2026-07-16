import React, { useCallback } from 'react'

import {
  ActionIconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import TextInput from 'uiSrc/components/base/inputs/TextInput'

import { VALUE_DECODER_TEST_ID } from './constants'
import { reorderList } from './reorderList'
import { SortableItem } from './SortableItem'
import * as S from './ValueDecoderModal.styles'

export interface KeyPatternsEditorProps {
  listId: string
  patterns: string[]
  onChange: (patterns: string[]) => void
}

export const KeyPatternsEditor = ({
  listId,
  patterns,
  onChange,
}: KeyPatternsEditorProps) => {
  const handlePatternChange = useCallback(
    (index: number, value: string) => {
      onChange(patterns.map((pattern, i) => (i === index ? value : pattern)))
    },
    [onChange, patterns],
  )

  const handleRemovePattern = useCallback(
    (index: number) => {
      const next = patterns.filter((_, i) => i !== index)
      onChange(next.length > 0 ? next : [''])
    },
    [onChange, patterns],
  )

  const handleAddPattern = useCallback(() => {
    onChange([...patterns, ''])
  }, [onChange, patterns])

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      onChange(reorderList(patterns, fromIndex, toIndex))
    },
    [onChange, patterns],
  )

  return (
    <S.KeyPatternsWrapper>
      {patterns.map((pattern, index) => {
        const isLast = index === patterns.length - 1
        const patternRow = (
          <S.KeyPatternRow>
            <TextInput
              value={pattern}
              onChange={(value) => handlePatternChange(index, value)}
              placeholder="room:chunk-state:*"
              data-testid={`${VALUE_DECODER_TEST_ID}-key-pattern-${index}`}
            />
            <ActionIconButton
              icon={DeleteIcon}
              aria-label="Remove key pattern"
              onClick={() => handleRemovePattern(index)}
              disabled={patterns.length === 1 && !pattern.trim()}
              data-testid={`${VALUE_DECODER_TEST_ID}-remove-key-pattern-${index}`}
            />
          </S.KeyPatternRow>
        )

        const sortableRow = (
          <SortableItem
            key={`pattern-${index}`}
            listId={listId}
            index={index}
            onReorder={handleReorder}
            testId={`${VALUE_DECODER_TEST_ID}-key-pattern-row-${index}`}
          >
            {patternRow}
          </SortableItem>
        )

        if (!isLast) {
          return sortableRow
        }

        return (
          <S.KeyPatternLastRow key={`pattern-${index}`}>
            {sortableRow}
            <SecondaryButton
              size="s"
              onClick={handleAddPattern}
              data-testid={`${VALUE_DECODER_TEST_ID}-add-key-pattern`}
            >
              Add Pattern
            </SecondaryButton>
          </S.KeyPatternLastRow>
        )
      })}
    </S.KeyPatternsWrapper>
  )
}
