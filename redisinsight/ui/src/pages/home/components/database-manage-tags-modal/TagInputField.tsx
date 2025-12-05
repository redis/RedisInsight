import React, { useState } from 'react'

import { TextInput } from 'uiSrc/components/base/inputs'
import { TagSuggestions } from './TagSuggestions'
import { TagInputFieldProps } from './TagInputField.types'

export const TagInputField = ({
  value,
  disabled,
  currentTagKeys,
  suggestedTagKey,
  rightContent,
  errorMessage,
  placeholder,
  onChange,
}: TagInputFieldProps) => {
  const isInvalid = Boolean(errorMessage)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div>
      <span>
        <TextInput
          value={value}
          disabled={disabled}
          valid={!isInvalid ? false : undefined}
          error={isInvalid ? errorMessage : undefined}
          onChange={(value) => onChange(value)}
          placeholder={placeholder}
          onFocusCapture={() => {
            setIsFocused(true)
          }}
          onBlurCapture={() => {
            setTimeout(() => {
              isFocused && setIsFocused(false)
            }, 150)
          }}
        />
        {isFocused && !isInvalid && (
          <TagSuggestions
            targetKey={suggestedTagKey}
            searchTerm={value}
            currentTagKeys={currentTagKeys}
            onChange={(value) => {
              setIsFocused(false)
              onChange(value)
            }}
          />
        )}
      </span>
      {rightContent}
    </div>
  )
}
