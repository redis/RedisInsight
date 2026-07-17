import React from 'react'
import { type AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'
import { useTranslation } from 'uiSrc/i18n'

export interface ResultCellProps {
  statusAdded: AddRedisDatabaseStatus | undefined
  messageAdded: string | undefined
}

export const ResultCell = ({ statusAdded, messageAdded }: ResultCellProps) => {
  const { t } = useTranslation()
  if (statusAdded === 'success') {
    return <Text>{messageAdded}</Text>
  }

  return (
    <RiTooltip
      position="left"
      title={t('cluster.result.error')}
      content={messageAdded}
    >
      <Row align="center" gap="s">
        <FlexItem>
          <RiIcon type="ToastDangerIcon" color="danger600" />
        </FlexItem>

        <FlexItem>
          <ColorText color="danger" className="flex-row euiTextAlign--center">
            {t('cluster.result.error')}
          </ColorText>
        </FlexItem>
      </Row>
    </RiTooltip>
  )
}
