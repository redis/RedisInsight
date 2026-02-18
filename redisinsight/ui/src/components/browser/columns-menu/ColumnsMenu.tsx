import React, { useState } from 'react'

import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { BrowserColumns } from 'uiSrc/constants'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Text } from 'uiSrc/components/base/text'

import * as S from './ColumnsMenu.styles'

export interface ColumnsMenuProps {
  shownColumns: BrowserColumns[]
  onToggleColumn: (checked: boolean, column: BrowserColumns) => void
}

const ColumnsMenu = ({ shownColumns, onToggleColumn }: ColumnsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleVisibility = () => setIsOpen(!isOpen)

  return (
    <RiPopover
      ownFocus={false}
      anchorPosition="downLeft"
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      button={
        <S.ColumnsButton
          onPressedChange={toggleVisibility}
          data-testid="btn-columns-actions"
          aria-label="columns"
          pressed={isOpen}
        >
          <RiIcon size="m" type="ColumnsIcon" />
          <Text size="s">Columns</Text>
        </S.ColumnsButton>
      }
    >
      <Col gap="m">
        <FlexItem>
          <Row align="center" gap="m">
            <FlexItem grow>
              <S.StyledCheckbox
                id="show-key-size"
                name="show-key-size"
                label="Key size"
                checked={shownColumns.includes(BrowserColumns.Size)}
                onChange={(e) =>
                  onToggleColumn(e.target.checked, BrowserColumns.Size)
                }
                data-testid="show-key-size"
              />
            </FlexItem>
            <FlexItem>
              <RiTooltip
                content="Hide the key size to avoid performance issues when working with large keys."
                position="top"
                anchorClassName="flex-row"
              >
                <RiIcon
                  type="InfoIcon"
                  size="m"
                  style={{ cursor: 'pointer' }}
                  data-testid="key-size-info-icon"
                />
              </RiTooltip>
            </FlexItem>
          </Row>
        </FlexItem>
        <FlexItem>
          <Checkbox
            id="show-ttl"
            name="show-ttl"
            label="TTL"
            checked={shownColumns.includes(BrowserColumns.TTL)}
            onChange={(e) =>
              onToggleColumn(e.target.checked, BrowserColumns.TTL)
            }
            data-testid="show-ttl"
          />
        </FlexItem>
      </Col>
    </RiPopover>
  )
}

export default React.memo(ColumnsMenu)
