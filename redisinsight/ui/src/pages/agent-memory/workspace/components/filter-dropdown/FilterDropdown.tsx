import React, { useState } from 'react'

import { RiPopover } from 'uiSrc/components/base/popover'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'

import * as S from './FilterDropdown.styles'

export interface FilterDropdownProps {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  emptyText?: string
  'data-testid'?: string
}

/**
 * Checkbox-list dropdown for one server-side search filter ("sessions",
 * "type", "topics", "entities"). The button shows the selection count;
 * picks land in the removable filter-pill row like every other filter.
 */
const FilterDropdown = ({
  label,
  options,
  selected,
  onToggle,
  emptyText = 'no options',
  'data-testid': testId,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const buttonLabel = selected.length ? `${label} (${selected.length})` : label

  return (
    <RiPopover
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      anchorPosition="downLeft"
      panelPaddingSize="s"
      data-testid={testId && `${testId}-popover`}
      button={
        <SecondaryButton
          size="small"
          aria-haspopup="true"
          aria-expanded={isOpen}
          data-testid={testId}
          onClick={() => setIsOpen(!isOpen)}
        >
          {buttonLabel} ▾
        </SecondaryButton>
      }
    >
      <S.FilterDropdownList>
        {options.map((value) => (
          <li key={value}>
            <Checkbox
              id={`${testId}-${value}`}
              label={value}
              checked={selected.includes(value)}
              data-testid={testId && `${testId}-option-${value}`}
              onChange={() => onToggle(value)}
            />
          </li>
        ))}
        {!options.length && (
          <li>
            <S.FilterDropdownEmpty>{emptyText}</S.FilterDropdownEmpty>
          </li>
        )}
      </S.FilterDropdownList>
    </RiPopover>
  )
}

export default FilterDropdown
