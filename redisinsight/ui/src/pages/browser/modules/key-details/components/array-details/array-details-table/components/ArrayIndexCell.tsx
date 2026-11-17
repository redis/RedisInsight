import React from 'react'

import { RiIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'
import { Text } from 'uiSrc/components/base/text'
import { formatLongName } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'

import { ArrayIndexCellProps } from './ArrayIndexCell.types'

const TEST_ID_PREFIX = 'array-details-table-index'

/**
 * Renders an array slot's index with a tooltip showing the full value —
 * indexes can be up to 20 digits (2^64-1), which need truncation in the
 * cell but should remain copyable from the tooltip.
 *
 * When the row is expandable (Search tab with Context on) a disclosure
 * chevron precedes the index, pointing down while expanded and right while
 * collapsed.
 */
export const ArrayIndexCell = ({
  index,
  canExpand,
  isExpanded,
}: ArrayIndexCellProps) => {
  const { t } = useTranslation()
  return (
    <Row align="center" gap="xs" grow={false}>
      {canExpand && (
        <FlexItem grow={false}>
          <RiIcon
            size="m"
            color="currentColor"
            type={isExpanded ? 'ChevronDownIcon' : 'ChevronRightIcon'}
            data-testid={`${TEST_ID_PREFIX}-${index}-expander`}
          />
        </FlexItem>
      )}
      <FlexItem grow style={{ minWidth: 0 }}>
        <Text
          component="div"
          color="secondary"
          style={{ maxWidth: '100%' }}
          data-testid={`${TEST_ID_PREFIX}-${index}`}
        >
          <RiTooltip
            title={t('browser.array.column.index')}
            position="bottom"
            anchorClassName="truncateText"
            content={formatLongName(index)}
          >
            <span className="truncateText">{index}</span>
          </RiTooltip>
        </Text>
      </FlexItem>
    </Row>
  )
}
