import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import {
  clearSearchingCommand,
  cliSettingsSelector,
  setCliEnteringCommand,
  toggleCli,
  toggleCliHelper,
  toggleHideCliHelper,
} from 'uiSrc/slices/cli/cli-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  monitorSelector,
  toggleHideMonitor,
  toggleMonitor,
} from 'uiSrc/slices/cli/monitor'
import FeatureFlagComponent from 'uiSrc/components/feature-flag-component'
import { FeatureFlags } from 'uiSrc/constants'

import { Text } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { HideFor, ShowFor } from 'uiSrc/components/base/utils/ShowHide'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import {
  CliIcon,
  DocumentationIcon,
  ProfilerIcon,
} from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from '../../styles.module.scss'

const ComponentBadge = styled(RiBadge)<{ isActive?: boolean }>`
  background-color: transparent !important;
  color: var(--euiTextSubduedColor) !important;
  height: 18px !important;
  border: none !important;
  cursor: pointer;
  user-select: none;

  &[title] {
    pointer-events: none;
  }

  ${({ isActive, theme }) => {
    // TODO: try to replace with semantic colors once the palette is bigger. 
    const bgColorActive =
      theme.name === 'dark' ? theme.color.azure600 : theme.color.azure200
    const bgColorHover =
      theme.name === 'dark' ? theme.color.azure500 : theme.color.azure300

    const color =
      theme.name === 'dark' ? theme.color.azure200 : theme.color.azure600

    return `
    ${isActive ? `background-color: ${bgColorActive} !important;` : ''}
    ${isActive ? `color: ${color} !important;` : ''}
    &:hover {
      background-color: ${bgColorHover} !important;
      color: ${color} !important;
    }
  `
  }}
`

const ContainerMinimized = styled.div`
  display: flex;
  align-items: center;
  padding-left: ${({ theme }) => theme.core.space.space050};
  height: 26px;
  line-height: 26px;
  border-left: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  border-right: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

const BottomGroupMinimized = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { isShowCli, cliClientUuid, isShowHelper, isMinimizedHelper } =
    useSelector(cliSettingsSelector)
  const { isShowMonitor, isMinimizedMonitor } = useSelector(monitorSelector)
  const dispatch = useDispatch()

  useEffect(
    () => () => {
      dispatch(clearSearchingCommand())
      dispatch(setCliEnteringCommand())
    },
    [],
  )

  const handleExpandCli = () => {
    sendEventTelemetry({
      event: isShowCli
        ? TelemetryEvent.CLI_MINIMIZED
        : TelemetryEvent.CLI_OPENED,
      eventData: {
        databaseId: instanceId,
      },
    })
    dispatch(toggleCli())
  }

  const handleExpandHelper = () => {
    sendEventTelemetry({
      event: isShowHelper
        ? TelemetryEvent.COMMAND_HELPER_MINIMIZED
        : TelemetryEvent.COMMAND_HELPER_OPENED,
      eventData: {
        databaseId: instanceId,
      },
    })
    isMinimizedHelper && dispatch(toggleHideCliHelper())
    dispatch(toggleCliHelper())
  }

  const handleExpandMonitor = () => {
    sendEventTelemetry({
      event: isShowMonitor
        ? TelemetryEvent.PROFILER_MINIMIZED
        : TelemetryEvent.PROFILER_OPENED,
      eventData: { databaseId: instanceId },
    })
    isMinimizedMonitor && dispatch(toggleHideMonitor())
    dispatch(toggleMonitor())
  }

  const onClickSurvey = () => {
    sendEventTelemetry({
      event: TelemetryEvent.USER_SURVEY_LINK_CLICKED,
    })
  }

  return (
    <ContainerMinimized>
      <Row align="center" responsive={false} style={{ height: '100%' }} gap="s">
        <FlexItem
          className={styles.componentBadgeItem}
          onClick={handleExpandCli}
          data-testid="expand-cli"
        >
          <ComponentBadge
            withIcon
            icon={CliIcon}
            label={
              <Text size="S" variant="semiBold">
                CLI
              </Text>
            }
            isActive={isShowCli || !!cliClientUuid}
          />
        </FlexItem>

        <FlexItem
          className={styles.componentBadgeItem}
          onClick={handleExpandHelper}
          data-testid="expand-command-helper"
        >
          <ComponentBadge
            withIcon
            icon={DocumentationIcon}
            label={
              <Text size="S" variant="semiBold">
                Command Helper
              </Text>
            }
            isActive={isShowHelper || isMinimizedHelper}
          />
        </FlexItem>
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <FlexItem
            className={styles.componentBadgeItem}
            onClick={handleExpandMonitor}
            data-testid="expand-monitor"
          >
            <ComponentBadge
              withIcon
              icon={ProfilerIcon}
              label={
                <Text size="S" variant="semiBold">
                  Profiler
                </Text>
              }
              isActive={isShowMonitor || isMinimizedMonitor}
            />
          </FlexItem>
        </FeatureFlagComponent>
      </Row>
      <FeatureFlagComponent name={FeatureFlags.envDependent}>
        <a
          className={styles.surveyLink}
          target="_blank"
          rel="noreferrer"
          href={EXTERNAL_LINKS.userSurvey}
          onClick={onClickSurvey}
          data-testid="user-survey-link"
        >
          <RiIcon type="SurveyIcon" className={styles.surveyIcon} />
          <HideFor sizes={['xs', 's']}>
            <span>Let us know what you think</span>
          </HideFor>
          <ShowFor sizes={['xs', 's']}>
            <span>Survey</span>
          </ShowFor>
        </a>
      </FeatureFlagComponent>
    </ContainerMinimized>
  )
}

export default BottomGroupMinimized
