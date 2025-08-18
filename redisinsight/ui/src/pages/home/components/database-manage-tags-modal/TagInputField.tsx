import React, { useState } from 'react'

import { RiTextInput } from 'uiBase/inputs'
import { TagSuggestions } from './TagSuggestions'
import { RiTooltip } from 'uiBase/display'

type TagInputFieldProps = {
  value: string
  disabled?: boolean
  currentTagKeys: Set<string>
  suggestedTagKey?: string
  rightContent?: React.ReactNode
  errorMessage?: string
  onChange: (value: string) => void
}

export const TagInputField = ({
  value,
  disabled,
  currentTagKeys,
  suggestedTagKey,
  rightContent,
  errorMessage,
  onChange,
}: TagInputFieldProps) => {
  const isInvalid = Boolean(errorMessage)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div>
      <RiTooltip content={errorMessage} position="top">
        <div>
          <RiTextInput
            value={value}
            disabled={disabled}
            valid={!isInvalid}
            onChange={(value) => onChange(value)}
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
        </div>
      </RiTooltip>
      {rightContent}
    </div>
  )
}
