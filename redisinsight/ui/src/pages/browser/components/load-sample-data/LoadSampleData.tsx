import React, { useState } from 'react'
import cx from 'classnames'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  bulkActionsSelector,
  bulkImportDefaultDataAction,
} from 'uiSrc/slices/browser/bulkActions'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { Environment } from 'apiClient'
import { useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

export interface Props {
  anchorClassName?: string
  onSuccess?: () => void
}

const LoadSampleData = (props: Props) => {
  const { anchorClassName, onSuccess } = props
  const { t } = useTranslation()
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const { id } = useAppSelector(connectedInstanceSelector)
  const { loading } = useAppSelector(bulkActionsSelector)
  const { environment } = useDatabaseEnvironment()
  const isProduction = environment === Environment.Production

  const dispatch = useAppDispatch()

  const handleSampleData = () => {
    setIsConfirmationOpen(false)
    dispatch(bulkImportDefaultDataAction(id, onSuccess))

    sendEventTelemetry({
      event: TelemetryEvent.IMPORT_SAMPLES_CLICKED,
      eventData: {
        databaseId: id,
      },
    })
  }

  return (
    <RiPopover
      ownFocus
      id="load-sample-data-popover"
      anchorPosition="upCenter"
      isOpen={isConfirmationOpen}
      closePopover={() => setIsConfirmationOpen(false)}
      panelClassName={cx('popoverLikeTooltip', styles.popover)}
      panelPaddingSize="none"
      anchorClassName={cx(styles.buttonWrapper, anchorClassName)}
      button={
        <RiTooltip
          content={
            isProduction
              ? t('browser.loadSampleData.productionTooltip')
              : undefined
          }
          data-testid="load-sample-data-btn-tooltip"
        >
          <SecondaryButton
            filled
            onClick={() => setIsConfirmationOpen(true)}
            className={styles.loadDataBtn}
            loading={loading}
            disabled={loading || isProduction}
            data-testid="load-sample-data-btn"
          >
            {t('browser.loadSampleData.button')}
          </SecondaryButton>
        </RiTooltip>
      }
    >
      <Row gap="m" responsive={false} style={{ padding: 15 }}>
        <FlexItem>
          <RiIcon size="m" type="ToastDangerIcon" color="attention500" />
        </FlexItem>
        <FlexItem>
          <Text variant="semiBold">
            {t('browser.loadSampleData.confirm.title')}
          </Text>
          <Spacer size="m" />
          <Text size="s">{t('browser.loadSampleData.confirm.message')}</Text>
          <Spacer size="l" />
          <Row justify="end">
            <FlexItem>
              <PrimaryButton
                size="s"
                icon={PlayFilledIcon}
                iconSide="right"
                color="secondary"
                onClick={handleSampleData}
                data-testid="load-sample-data-btn-confirm"
              >
                {t('browser.loadSampleData.confirm.execute')}
              </PrimaryButton>
            </FlexItem>
          </Row>
        </FlexItem>
      </Row>
    </RiPopover>
  )
}

export default LoadSampleData
