import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'
import { isArray, upperFirst } from 'lodash'

import * as keys from 'uiSrc/constants/keys'
import { PipelineJobsTabs } from 'uiSrc/slices/interfaces/rdi'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  rdiDryRunJob,
  rdiDryRunJobSelector,
  setInitialDryRunJob,
} from 'uiSrc/slices/rdi/dryRun'
import MonacoJson from 'uiSrc/components/monaco-editor/components/monaco-json'
import DryRunJobCommands from 'uiSrc/pages/rdi/pipeline-management/components/dry-run-job-commands'
import DryRunJobTransformations from 'uiSrc/pages/rdi/pipeline-management/components/dry-run-job-transformations'
import { createAxiosError, formatLongName, yamlToJson } from 'uiSrc/utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

import { Text, Title } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  PlayFilledIcon,
  CancelSlimIcon,
  ExtendIcon,
  ShrinkIcon,
} from 'uiSrc/components/base/icons'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { RiTooltip } from 'uiSrc/components'
import {
  RiSelect,
  RiSelectOption,
  defaultValueRender,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { DryRunPanelContainer } from 'uiSrc/pages/rdi/pipeline-management/components/jobs-panel/styles'
import { Button, TextButton } from '@redis-ui/components'
import { Trans, useTranslation } from 'uiSrc/i18n'

export interface Props {
  job: string
  name: string
  onClose: () => void
}

const getTargetOption = (value: string) => {
  const formattedValue = formatLongName(value)

  return {
    value,
    inputDisplay: formattedValue,
    dropdownDisplay: formattedValue,
    'data-test-subj': `target-option-${value}`,
  }
}

const DryRunJobPanel = (props: Props) => {
  const { t } = useTranslation()
  const { job, name, onClose } = props
  const { loading: isDryRunning, results } =
    useAppSelector(rdiDryRunJobSelector)

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [selectedTab, changeSelectedTab] = useState<PipelineJobsTabs>(
    PipelineJobsTabs.Transformations,
  )
  const [input, setInput] = useState<string>('{\n}')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [targetOptions, setTargetOptions] = useState<RiSelectOption[]>([])
  const [selectedTarget, setSelectedTarget] = useState<string>()

  const dispatch = useAppDispatch()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  useEffect(() => {
    window.addEventListener('keydown', handleEscFullScreen)
    return () => {
      window.removeEventListener('keydown', handleEscFullScreen)
    }
  }, [isFullScreen])

  useEffect(() => {
    try {
      JSON.parse(input)
      setIsFormValid(true)
    } catch (e) {
      setIsFormValid(false)
    }
  }, [input])

  // componentWillUnmount
  useEffect(
    () => () => {
      dispatch(setInitialDryRunJob())
    },
    [],
  )

  useEffect(() => {
    if (!results?.output || !isArray(results.output)) return

    const targets = results.output
      .filter(({ connection }) => connection)
      .map(({ connection }) => getTargetOption(connection))
    setTargetOptions(targets)
    setSelectedTarget(targets[0]?.value)
  }, [results])

  const handleEscFullScreen = (event: KeyboardEvent) => {
    if (event.key === keys.ESCAPE && isFullScreen) {
      handleFullScreen()
    }
  }

  const handleFullScreen = () => {
    setIsFullScreen((value) => !value)
  }

  const handleDryRun = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEST_JOB_RUN,
      eventData: {
        id: rdiInstanceId,
      },
    })
    const JSONJob = yamlToJson(job, (msg) => {
      dispatch(
        addErrorNotification(
          createAxiosError({
            message: (
              <>
                <Text>
                  {t('rdi.pipeline.invalidStructure', {
                    name: upperFirst(name),
                  })}
                </Text>
                <Text>{msg}</Text>
              </>
            ),
          }),
        ),
      )
    })
    if (!JSONJob) {
      return
    }
    const JSONInput = JSON.parse(input)
    const formattedValue = isArray(JSONInput) ? JSONInput : [JSONInput]

    dispatch(rdiDryRunJob(rdiInstanceId, formattedValue, JSONJob))
  }

  const isSelectAvailable =
    selectedTab === PipelineJobsTabs.Output &&
    !!results?.output &&
    results?.output?.length > 1 &&
    !!targetOptions.length

  const tabs: TabInfo[] = [
    {
      value: PipelineJobsTabs.Transformations,
      label: (
        <RiTooltip
          content={
            <Text>
              <Trans
                i18nKey="rdi.pipeline.dryRun.transformationTooltip"
                components={{ break: <br /> }}
              />
            </Text>
          }
          data-testid="transformation-output-tooltip"
        >
          <Text>{t('rdi.pipeline.dryRun.transformationOutput')}</Text>
        </RiTooltip>
      ),
      content: null,
    },
    {
      value: PipelineJobsTabs.Output,
      label: (
        <RiTooltip
          content={
            <Text>
              <Trans
                i18nKey="rdi.pipeline.dryRun.jobOutputTooltip"
                components={{ break: <br /> }}
              />
            </Text>
          }
          data-testid="job-output-tooltip"
        >
          <Text>{t('rdi.pipeline.dryRun.jobOutput')}</Text>
        </RiTooltip>
      ),
      content: null,
    },
  ]

  const handleTabChange = (name: string) => {
    if (selectedTab === name) return
    changeSelectedTab(name as PipelineJobsTabs)
  }

  return (
    <DryRunPanelContainer
      grow
      gap="l"
      data-testid="dry-run-panel"
      isFullScreen={isFullScreen}
    >
      {/* Header */}
      <FlexItem>
        <Row align="center" justify="between">
          <Title size="L" color="primary">
            {t('rdi.pipeline.dryRun.title')}
          </Title>
          <FlexItem>
            <Row gap="s">
              <IconButton
                icon={isFullScreen ? ShrinkIcon : ExtendIcon}
                aria-label={t('rdi.pipeline.dryRun.fullscreenAria')}
                onClick={handleFullScreen}
                data-testid="fullScreen-dry-run-btn"
              />
              <IconButton
                icon={CancelSlimIcon}
                aria-label={t('rdi.pipeline.dryRun.closeAria')}
                onClick={onClose}
                data-testid="close-dry-run-btn"
              />
            </Row>
          </FlexItem>
        </Row>
        <Text>{t('rdi.pipeline.dryRun.inputHelp')}</Text>
      </FlexItem>
      {/* Input section */}
      <FlexItem>
        <Col gap="s">
          <Title size="S" color="primary">
            {t('rdi.pipeline.dryRun.inputTitle')}
          </Title>
          <MonacoJson
            value={input}
            onChange={setInput}
            disabled={false}
            data-testid="input-value"
            fullHeight
          />
          <Row responsive justify="end">
            <FlexItem>
              <RiTooltip
                content={
                  isFormValid ? null : t('rdi.pipeline.dryRun.inputInvalid')
                }
                position="top"
              >
                <TextButton
                  variant="primary-inline"
                  onClick={handleDryRun}
                  disabled={isDryRunning || !isFormValid}
                  data-testid="dry-run-btn"
                >
                  <Button.Icon icon={PlayFilledIcon} customSize="12" />
                  {t('rdi.pipeline.dryRun.runButton')}
                </TextButton>
              </RiTooltip>
            </FlexItem>
          </Row>
        </Col>
      </FlexItem>
      {/* Results section */}
      <FlexItem grow>
        <Col gap="m">
          {isSelectAvailable && (
            <RiSelect
              options={targetOptions}
              valueRender={defaultValueRender}
              value={selectedTarget}
              onChange={(value) => setSelectedTarget(value)}
              data-testid="target-select"
            />
          )}
          <FlexItem grow>
            <Tabs
              tabs={tabs}
              value={selectedTab}
              onChange={handleTabChange}
              data-testid="pipeline-jobs-tabs"
            />
            {selectedTab === PipelineJobsTabs.Transformations && (
              <DryRunJobTransformations />
            )}
            {selectedTab === PipelineJobsTabs.Output && (
              <DryRunJobCommands target={selectedTarget} />
            )}
          </FlexItem>
        </Col>
      </FlexItem>
    </DryRunPanelContainer>
  )
}

export default DryRunJobPanel
