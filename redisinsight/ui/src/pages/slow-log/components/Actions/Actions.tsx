import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DurationUnits } from 'uiSrc/constants'
import { slowLogSelector } from 'uiSrc/slices/analytics/slowlog'
import { AutoRefresh } from 'uiSrc/components'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  Col,
  FlexGroup,
  FlexItem,
  Row,
} from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EraserIcon, SettingsIcon } from 'uiSrc/components/base/icons'
import {
  DestructiveButton,
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text, Title } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

import SlowLogConfig from '../SlowLogConfig'
import { StyledDatabaseName, StyledInfoIcon } from './Actions.styles'

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
  const { instanceId } = useParams<{ instanceId: string }>()
  const { name = '' } = useSelector(connectedInstanceSelector)
  const { loading, lastRefreshTime } = useSelector(slowLogSelector)

  const [isPopoverClearOpen, setIsPopoverClearOpen] = useState(false)
  const [isPopoverConfigOpen, setIsPopoverConfigOpen] = useState(false)

  const showClearPopover = () => {
    setIsPopoverClearOpen((isPopoverClearOpen) => !isPopoverClearOpen)
  }

  const closePopoverClear = () => {
    setIsPopoverClearOpen(false)
  }
  const showConfigPopover = () => {
    setIsPopoverConfigOpen((isPopoverConfigOpen) => !isPopoverConfigOpen)
  }

  const closePopoverConfig = () => {
    setIsPopoverConfigOpen(false)
  }

  const handleClearClick = () => {
    onClear()
    closePopoverClear()
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

  const ToolTipContent = (
    <FlexGroup direction="column" gap="l">
      <Col gap="m">
        <Title size="S" color="primary">
          Clear Slow Log?
        </Title>
        <Col>
          <Text size="m" color="primary">
            Slow Log will be cleared for&nbsp;
            <StyledDatabaseName>{name}</StyledDatabaseName>
          </Text>
          <Text size="xs" color="secondary">
            NOTE: This is server configuration
          </Text>
        </Col>
      </Col>
      <Row justify="end">
        <DestructiveButton
          size="small"
          icon={EraserIcon}
          onClick={() => handleClearClick()}
          data-testid="reset-confirm-btn"
        >
          Clear
        </DestructiveButton>
      </Row>
    </FlexGroup>
  )

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
            <SecondaryButton
              size="small"
              inverted
              icon={SettingsIcon}
              aria-label="Configure"
              onClick={() => showConfigPopover()}
              data-testid="configure-btn"
            >
              Configure
            </SecondaryButton>
          }
        >
          <SlowLogConfig
            closePopover={closePopoverConfig}
            onRefresh={onRefresh}
          />
        </RiPopover>
      </FlexItem>

      {!isEmptySlowLog && (
        <FlexItem>
          <RiPopover
            anchorPosition="leftCenter"
            ownFocus
            isOpen={isPopoverClearOpen}
            closePopover={closePopoverClear}
            panelPaddingSize="m"
            button={
              <RiTooltip position="left" content="Clear Slow Log">
                <IconButton
                  icon={EraserIcon}
                  aria-label="Clear Slow Log"
                  onClick={() => showClearPopover()}
                  data-testid="clear-btn"
                />
              </RiTooltip>
            }
          >
            {ToolTipContent}
          </RiPopover>
        </FlexItem>
      )}

      <FlexItem>
        <RiTooltip
          title="Slow Log"
          position="bottom"
          content={
            <span data-testid="slowlog-tooltip-text">
              Slow Log is a list of slow operations for your Redis instance.
              These can be used to troubleshoot performance issues.
              <Spacer size="xs" />
              Each entry in the list displays the command, duration and
              timestamp. Any transaction that exceeds{' '}
              <b>slowlog-log-slower-than</b> {durationUnit} are recorded up to a
              maximum of <b>slowlog-max-len</b> after which older entries are
              discarded.
            </span>
          }
        >
          <StyledInfoIcon>
            <RiIcon type="InfoIcon" data-testid="slow-log-tooltip-icon" />
          </StyledInfoIcon>
        </RiTooltip>
      </FlexItem>
    </Row>
  )
}

export default Actions
