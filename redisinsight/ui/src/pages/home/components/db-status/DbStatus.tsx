import React from 'react'
import { differenceInDays } from 'date-fns'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { getTutorialCapability, Maybe } from 'uiSrc/utils'

import { appContextCapability } from 'uiSrc/slices/app/context'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { RiTooltip } from 'uiSrc/components'
import { Indicator } from 'uiSrc/components/base/text/text.styles'
import { Col } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'
import {
  CheckCloudDatabase,
  WarningWithCapability,
  WarningWithoutCapability,
} from './texts'
import { IconWrapper, InfoIcon } from './DbStatus.styles'

export interface Props {
  id: string
  lastConnection: Maybe<Date>
  createdAt: Maybe<Date>
  isNew: boolean
  isFree?: boolean
}

export enum WarningTypes {
  CheckIfDeleted = 'checkIfDeleted',
  TryDatabase = 'tryDatabase',
}

interface WarningTooltipProps {
  id: string
  content: React.ReactNode
  capabilityTelemetry?: string
  type?: string
  isCapabilityNotShown?: boolean
}

const LAST_CONNECTION_SM = 3
const LAST_CONNECTION_L = 16

const DbStatus = (props: Props) => {
  const { t } = useTranslation()
  const { id, lastConnection, createdAt, isNew, isFree } = props

  const { source } = useAppSelector(appContextCapability)
  const capability = getTutorialCapability(source!)
  const isCapabilityNotShown = Boolean(isShowCapabilityTutorialPopover(isFree))
  let daysDiff = 0

  try {
    daysDiff = lastConnection
      ? differenceInDays(new Date(), new Date(lastConnection))
      : createdAt
        ? differenceInDays(new Date(), new Date(createdAt))
        : 0
  } catch {
    // nothing to do
  }

  const renderWarningTooltip = (content: React.ReactNode, type?: string) => (
    <RiTooltip
      content={
        <WarningTooltipContent
          id={id}
          capabilityTelemetry={capability?.telemetryName}
          content={content}
          type={type}
          isCapabilityNotShown={isCapabilityNotShown}
        />
      }
      position="right"
    >
      <IconWrapper data-testid={`database-status-${type}-${id}`}>
        <InfoIcon />
      </IconWrapper>
    </RiTooltip>
  )

  if (isFree && daysDiff >= LAST_CONNECTION_L) {
    return renderWarningTooltip(
      <CheckCloudDatabase />,
      WarningTypes.CheckIfDeleted,
    )
  }

  if (isFree && daysDiff >= LAST_CONNECTION_SM) {
    return renderWarningTooltip(
      isCapabilityNotShown && capability.name ? (
        <WarningWithCapability capability={capability.name} />
      ) : (
        <WarningWithoutCapability />
      ),
      'tryDatabase',
    )
  }

  if (isNew) {
    return (
      <RiTooltip
        content={t('home.databaseList.dbStatus.tooltip.new')}
        position="top"
      >
        <IconWrapper data-testid={`database-status-new-${id}`}>
          <Indicator $color="var(--euiColorPrimary)" />
        </IconWrapper>
      </RiTooltip>
    )
  }

  return null
}

// separated to send event when content is displayed
const WarningTooltipContent = (props: WarningTooltipProps) => {
  const { id, content, capabilityTelemetry, type, isCapabilityNotShown } = props

  sendEventTelemetry({
    event: TelemetryEvent.CLOUD_NOT_USED_DB_NOTIFICATION_VIEWED,
    eventData: {
      databaseId: id,
      capability: isCapabilityNotShown
        ? capabilityTelemetry
        : TELEMETRY_EMPTY_VALUE,
      type,
    },
  })

  return <Col>{content}</Col>
}

export default DbStatus
