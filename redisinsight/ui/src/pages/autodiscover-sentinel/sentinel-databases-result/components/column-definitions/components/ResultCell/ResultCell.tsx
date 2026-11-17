import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Loader } from 'uiSrc/components/base/display'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { ColorText } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout'
import { RiIcon } from 'uiSrc/components/base/icons'
import { useTranslation } from 'uiSrc/i18n'

import { AddErrorButton } from '../AddErrorButton/AddErrorButton'
import type { ResultCellProps } from './ResultCell.types'

export const ResultCell = ({
  status,
  message = '',
  name,
  error,
  alias,
  loading = false,
  addActions,
  onAddInstance,
}: ResultCellProps) => {
  const { t } = useTranslation()

  return (
    <Row
      data-testid={`status_${name}_${status}`}
      align="center"
      justify="between"
      gap="m"
    >
      {loading && <Loader size="L" />}
      {!loading && status === AddRedisDatabaseStatus.Success && (
        <CellText>{message}</CellText>
      )}
      {!loading && status !== AddRedisDatabaseStatus.Success && (
        <RiTooltip
          position="right"
          title={t('autodiscover.sentinel.cell.error')}
          content={message}
        >
          <FlexItem direction="row" grow={false}>
            <ColorText size="S" color="danger" style={{ cursor: 'pointer' }}>
              {t('autodiscover.sentinel.cell.error')}
            </ColorText>
            <Spacer size="s" direction="horizontal" />
            <RiIcon size="M" type="ToastDangerIcon" color="danger600" />
          </FlexItem>
        </RiTooltip>
      )}
      {addActions && onAddInstance && (
        <AddErrorButton
          name={name}
          error={error}
          alias={alias}
          loading={loading}
          onAddInstance={onAddInstance}
        />
      )}
    </Row>
  )
}
