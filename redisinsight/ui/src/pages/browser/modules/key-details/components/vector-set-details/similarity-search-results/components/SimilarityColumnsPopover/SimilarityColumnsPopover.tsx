import React, { useState } from 'react'

import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { RiPopover } from 'uiSrc/components/base'
import { RiTooltip } from 'uiSrc/components'
import { ColumnsIcon } from 'uiSrc/components/base/icons'
import { EmptyButton, IconButton } from 'uiSrc/components/base/forms/buttons'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Col } from 'uiSrc/components/base/layout/flex'

import {
  COLUMNS_BUTTON_TEST_ID,
  COLUMNS_POPOVER_TEST_ID,
  DEFAULT_TITLE,
} from './constants'
import { Props } from './SimilarityColumnsPopover.types'

/**
 * Columns popover for the similarity-search results table.
 *
 * Built locally (instead of reusing the shared `ColumnsConfigPopover`) so the
 * trigger can collapse to an icon-only `IconButton` on narrow viewports,
 * mirroring `ClearResultsAction`.
 */
const SimilarityColumnsPopover = ({
  width,
  columnsMap,
  shownColumns,
  onShownColumnsChange,
  title = DEFAULT_TITLE,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const showLabel = width > MIDDLE_SCREEN_RESOLUTION

  const toggle = () => setIsOpen((v) => !v)
  const close = () => setIsOpen(false)

  const handleToggle = (checked: boolean, col: string) => {
    if (!checked && shownColumns.length === 1 && shownColumns.includes(col)) {
      return
    }

    const next = checked
      ? [...shownColumns, col]
      : shownColumns.filter((c) => c !== col)
    onShownColumnsChange(next)
  }

  const trigger = showLabel ? (
    <EmptyButton
      size="small"
      icon={ColumnsIcon}
      onClick={toggle}
      data-testid={COLUMNS_BUTTON_TEST_ID}
      aria-label={title}
    >
      {title}
    </EmptyButton>
  ) : (
    <IconButton
      icon={ColumnsIcon}
      onClick={toggle}
      data-testid={COLUMNS_BUTTON_TEST_ID}
      aria-label={title}
    />
  )

  return (
    <RiTooltip content={showLabel ? '' : title} position="left">
      <RiPopover
        ownFocus={false}
        anchorPosition="downLeft"
        isOpen={isOpen}
        closePopover={close}
        data-testid={COLUMNS_POPOVER_TEST_ID}
        button={trigger}
      >
        <Col gap="m">
          {Array.from(columnsMap.entries()).map(([field, name]) => (
            <Checkbox
              key={`show-${field}`}
              id={`show-${field}`}
              name={`show-${field}`}
              label={name}
              checked={shownColumns.includes(field)}
              disabled={
                shownColumns.includes(field) && shownColumns.length === 1
              }
              onChange={(e) => handleToggle(e.target.checked, field)}
              data-testid={`show-${field}`}
            />
          ))}
        </Col>
      </RiPopover>
    </RiTooltip>
  )
}

export { SimilarityColumnsPopover }
