import React, { useCallback, useState } from 'react'
import { format } from 'date-fns'

import { ChevronDownIcon } from 'uiSrc/components/base/icons'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiPopover } from 'uiSrc/components/base/popover/RiPopover'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

import { RiDatePickerProps } from './RiDatePicker.types'
import { RiCalendar } from 'uiSrc/components/base/display/calendar'

const RiDatePicker = ({
  selected,
  onSelect,
  label = 'Date',
}: RiDatePickerProps) => {
  const [open, setOpen] = useState(false)
  const currentDate = selected ?? new Date()

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      onSelect?.(day)
      setOpen(false)
    },
    [onSelect],
  )

  return (
    <Col data-testid="ri-date-picker">
      {label && <Text size="s">{label}</Text>}
      <RiPopover
        isOpen={open}
        closePopover={() => setOpen(false)}
        anchorPosition="downCenter"
        panelPaddingSize="none"
        trigger={
          <SecondaryButton
            size="large"
            icon={ChevronDownIcon}
            iconSide="right"
            onClick={() => setOpen((prev) => !prev)}
            data-testid="ri-date-picker-trigger"
            style={{ minWidth: '10rem' }}
          >
            {format(currentDate, 'PPP')}
          </SecondaryButton>
        }
      >
        <RiCalendar
          mode="single"
          selected={currentDate}
          onSelect={handleSelect}
        />
      </RiPopover>
    </Col>
  )
}

export { RiDatePicker }
