import React, { useState } from 'react'

import { RiPopover } from 'uiSrc/components/base'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { ColumnsIcon } from 'uiSrc/components/base/icons'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Col } from 'uiSrc/components/base/layout/flex'

interface ColumnsConfigPopoverProps<T extends string = string> {
  columnsMap: Map<T, string>
  shownColumns: T[]
  onChange: (nextShownColumns: T[], diff: { shown: T[]; hidden: T[] }) => void
  buttonLabel?: React.ReactNode
  buttonTestId?: string
  popoverTestId?: string
}

function ColumnsConfigPopover<T extends string = string>({
  columnsMap,
  shownColumns,
  onChange,
  buttonLabel = 'Columns',
  buttonTestId = 'btn-columns-config',
  popoverTestId = 'columns-config-popover',
}: ColumnsConfigPopoverProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((v) => !v)

  const handleToggle = (checked: boolean, col: T) => {
    // prevent hiding the last remaining column
    if (!checked && shownColumns.length === 1 && shownColumns.includes(col)) {
      return
    }

    const next = checked
      ? [...shownColumns, col]
      : shownColumns.filter((c) => c !== col)

    onChange(next, {
      shown: checked ? [col] : ([] as T[]),
      hidden: checked ? ([] as T[]) : [col],
    })
  }

  return (
    <RiPopover
      ownFocus={false}
      anchorPosition="downLeft"
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      data-testid={popoverTestId}
      button={
        <EmptyButton
          icon={ColumnsIcon}
          onClick={toggle}
          data-testid={buttonTestId}
          aria-label="columns"
        >
          {buttonLabel}
        </EmptyButton>
      }
    >
      <Col gap="m">
        {Array.from(columnsMap.entries()).map(([field, name]) => (
          <Checkbox
            key={`show-${field}`}
            id={`show-${field}`}
            name={`show-${field}`}
            label={name}
            checked={shownColumns.includes(field)}
            disabled={shownColumns.includes(field) && shownColumns.length === 1}
            onChange={(e) => handleToggle(e.target.checked, field)}
            data-testid={`show-${field}`}
          />
        ))}
      </Col>
    </RiPopover>
  )
}

export default ColumnsConfigPopover
