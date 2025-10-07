// Import the original type but don't re-export it
import type { SelectOption, SelectValueRender } from '@redis-ui/components'
import React from 'react'

export { Select as RiSelect } from '@redis-ui/components'
export type { SelectOption, SelectValueRender, SelectValueRenderParams } from '@redis-ui/components'

// Define our extended type
export type RiSelectOption = SelectOption & {
  'data-test-subj'?: string
  dropdownDisplay?: string | JSX.Element | null
  inputDisplay?: string | JSX.Element | null
}

export const defaultValueRender: SelectValueRender<RiSelectOption> = ({
  option,
  isOptionValue,
}) => {
  if (!option.inputDisplay) {
    return option.label ?? option.value
  }

  if (isOptionValue) {
    // render dropdown list item
    if (option.dropdownDisplay && typeof option.dropdownDisplay !== 'string') {
      // allow for custom dropdown display element
      return option.dropdownDisplay
    }
    return (
      <span
        data-test-subj={option['data-test-subj']}
        data-testid={option['data-test-subj']}
      >
        {option.dropdownDisplay ?? option.inputDisplay}
      </span>
    )
  }
  // allow for custom input display element
  if (typeof option.inputDisplay !== 'string') {
    return option.inputDisplay
  }
  return (
    <span
      data-test-subj={`${option['data-test-subj']}-prompt`}
      data-testid={`${option['data-test-subj']}-prompt`}
    >
      {option.inputDisplay}
    </span>
  )
}
