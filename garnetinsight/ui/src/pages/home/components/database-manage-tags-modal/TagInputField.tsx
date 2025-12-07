import React, { useState } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { TextInput } from 'uiSrc/components/base/inputs'
import { TagSuggestions } from './TagSuggestions'

type TagInputFieldProps = {
  value: string
  disabled?: boolean
  currentTagKeys: Set<string>
  suggestedTagKey?: string
  rightContent?: React.ReactNode
  errorMessage?: string
  placeholder?: string
  onChange: (value: string) => void
}

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
      <RiTooltip content={errorMessage} position="top">
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
      </RiTooltip>
      {rightContent}
    </div>
  )
}
