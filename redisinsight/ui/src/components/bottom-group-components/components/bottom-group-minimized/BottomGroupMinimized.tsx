import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

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
import {
  CliIcon,
  DocumentationIcon,
  ProfilerIcon,
} from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import {
  ComponentBadge,
  ContainerMinimized,
} from './ButtonGroupMinimized.styles'
import * as S from '../../BottomGroupComponents.styles'

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
        <FlexItem onClick={handleExpandCli} data-testid="expand-cli">
          <ComponentBadge
            withIcon
            icon={CliIcon}
            label={
              <Text size="S" variant="semiBold" component="span">
                CLI
              </Text>
            }
            isActive={isShowCli || !!cliClientUuid}
          />
        </FlexItem>

        <FlexItem
          onClick={handleExpandHelper}
          data-testid="expand-command-helper"
        >
          <ComponentBadge
            withIcon
            icon={DocumentationIcon}
            label={
              <Text size="S" variant="semiBold" component="span">
                Command Helper
              </Text>
            }
            isActive={isShowHelper || isMinimizedHelper}
          />
        </FlexItem>
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <FlexItem onClick={handleExpandMonitor} data-testid="expand-monitor">
            <ComponentBadge
              withIcon
              icon={ProfilerIcon}
              label={
                <Text size="S" variant="semiBold" component="span">
                  Profiler
                </Text>
              }
              isActive={isShowMonitor || isMinimizedMonitor}
            />
          </FlexItem>
        </FeatureFlagComponent>
      </Row>
      <FeatureFlagComponent name={FeatureFlags.envDependent}>
        <S.SurveyLink
          target="_blank"
          rel="noreferrer"
          href={EXTERNAL_LINKS.userSurvey}
          onClick={onClickSurvey}
          data-testid="user-survey-link"
        >
          <S.SurveyIcon>
            <RiIcon type="SurveyIcon" />
          </S.SurveyIcon>
          <HideFor sizes={['xs', 's']}>
            <span>Let us know what you think</span>
          </HideFor>
          <ShowFor sizes={['xs', 's']}>
            <span>Survey</span>
          </ShowFor>
        </S.SurveyLink>
      </FeatureFlagComponent>
    </ContainerMinimized>
  )
}

export default BottomGroupMinimized
