import React, { useState } from 'react'

import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { Text } from 'uiSrc/components/base/text'
import { useDebouncedEffect } from 'uiSrc/services'

import {
  ATTRIBUTES_EDITOR_OPTIONS,
  ATTRIBUTES_WARNING_MESSAGE,
  DEFAULT_ATTRIBUTE_EDITOR_HEIGHT,
  JSON_VALIDATION_DEBOUNCE_MS,
} from './constants'
import { isJsonValid } from './utils'
import { AttributeEditorProps } from './AttributeEditor.types'
import * as S from './AttributeEditor.styles'

const AttributeEditor = ({
  value,
  onChange,
  isInEditMode = false,
  height = DEFAULT_ATTRIBUTE_EDITOR_HEIGHT,
  testId = 'attribute-editor',
}: AttributeEditorProps) => {
  const [showNonJsonWarning, setShowNonJsonWarning] = useState(false)

  useDebouncedEffect(
    () => {
      setShowNonJsonWarning(!isJsonValid(value))
    },
    JSON_VALIDATION_DEBOUNCE_MS,
    [value],
  )

  return (
    <S.Wrapper>
      <S.EditorContainer $height={height}>
        <CodeEditor
          language="json"
          value={value}
          options={{
            ...ATTRIBUTES_EDITOR_OPTIONS,
            readOnly: !isInEditMode,
          }}
          onChange={onChange}
          data-testid={testId}
        />
      </S.EditorContainer>
      <S.StyledBanner
        show={showNonJsonWarning}
        variant="attention"
        size="S"
        message={
          <Text size="s" component="span">
            {ATTRIBUTES_WARNING_MESSAGE}
          </Text>
        }
        data-testid={`${testId}-warning`}
      />
    </S.Wrapper>
  )
}

export { AttributeEditor }
