import React, { useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'
import { Trans, useTranslation } from 'uiSrc/i18n'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DurationUnits } from 'uiSrc/constants'
import { slowLogSelector } from 'uiSrc/slices/analytics/slowlog'
import { AutoRefresh } from 'uiSrc/components'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EraserIcon, SettingsIcon } from 'uiSrc/components/base/icons'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

import SlowLogConfig from '../SlowLogConfig'
import { StyledInfoIconWrapper } from './Actions.styles'
import { ClearSlowLogModal } from '../ClearSlowLogModal/ClearSlowLogModal'

export interface Props {
  width: number
  isEmptySlowLog: boolean
  durationUnit: Nullable<DurationUnits>
  onClear: () => void
  onRefresh: (maxLen?: number) => void
}

const HIDE_REFRESH_LABEL_WIDTH = 850

const Actions = (props: Props) => {
  const {
    isEmptySlowLog,
    durationUnit,
    width,
    onClear = () => {},
    onRefresh,
  } = props
  const { t } = useTranslation()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { name = '' } = useAppSelector(connectedInstanceSelector)
  const { loading, lastRefreshTime } = useAppSelector(slowLogSelector)

  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isPopoverConfigOpen, setIsPopoverConfigOpen] = useState(false)

  const showClearModal = () => {
    setIsClearModalOpen((isClearModalOpen) => !isClearModalOpen)
  }

  const closeClearModal = () => {
    setIsClearModalOpen(false)
  }
  const showConfigPopover = () => {
    setIsPopoverConfigOpen((isPopoverConfigOpen) => !isPopoverConfigOpen)
  }

  const closePopoverConfig = () => {
    setIsPopoverConfigOpen(false)
  }

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.SLOWLOG_AUTO_REFRESH_ENABLED
        : TelemetryEvent.SLOWLOG_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: instanceId,
        refreshRate: enableAutoRefresh ? +refreshRate : undefined,
      },
    })
  }

  const handleChangeAutoRefreshRate = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    if (enableAutoRefresh) {
      sendEventTelemetry({
        event: TelemetryEvent.SLOWLOG_AUTO_REFRESH_ENABLED,
        eventData: {
          databaseId: instanceId,
          refreshRate: +refreshRate,
        },
      })
    }
  }

  return (
    <Row gap="s" align="center">
      <FlexItem>
        <AutoRefresh
          postfix="slowlog"
          loading={loading}
          displayText={width > HIDE_REFRESH_LABEL_WIDTH}
          lastRefreshTime={lastRefreshTime}
          onRefresh={() => onRefresh()}
          onEnableAutoRefresh={handleEnableAutoRefresh}
          onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
          testid="slowlog"
        />
      </FlexItem>

      <FlexItem>
        <RiPopover
          ownFocus
          anchorPosition="downRight"
          isOpen={isPopoverConfigOpen}
          panelPaddingSize="m"
          closePopover={() => {}}
          button={
            <PrimaryButton
              size="small"
              icon={SettingsIcon}
              aria-label={t('analytics.slowLog.actions.configure')}
              onClick={() => showConfigPopover()}
              data-testid="configure-btn"
            >
              {t('analytics.slowLog.actions.configure')}
            </PrimaryButton>
          }
        >
          <SlowLogConfig
            closePopover={closePopoverConfig}
            onRefresh={onRefresh}
          />
        </RiPopover>
      </FlexItem>

      {!isEmptySlowLog && (
        <>
          <IconButton
            icon={EraserIcon}
            aria-label={t('analytics.slowLog.actions.clear')}
            onClick={() => showClearModal()}
            data-testid="clear-btn"
          />

          <ClearSlowLogModal
            name={name}
            isOpen={isClearModalOpen}
            onClose={closeClearModal}
            onClear={onClear}
          />
        </>
      )}

      <FlexItem>
        <RiTooltip
          title={t('analytics.slowLog.actions.tooltip.title')}
          position="bottom"
          content={
            <span data-testid="slowlog-tooltip-text">
              <Trans
                i18nKey="analytics.slowLog.actions.tooltip.body"
                values={{
                  unit: durationUnit
                    ? t(
                        durationUnit === DurationUnits.milliSeconds
                          ? 'analytics.units.milliseconds'
                          : 'analytics.units.microseconds',
                      )
                    : '',
                }}
                components={{
                  spacer: <Spacer size="xs" />,
                  bold: <b />,
                }}
              />
            </span>
          }
        >
          <StyledInfoIconWrapper>
            <RiIcon type="InfoIcon" data-testid="slow-log-tooltip-icon" />
          </StyledInfoIconWrapper>
        </RiTooltip>
      </FlexItem>
    </Row>
  )
}

export default Actions
