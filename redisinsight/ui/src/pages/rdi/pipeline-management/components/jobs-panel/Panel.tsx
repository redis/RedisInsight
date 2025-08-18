import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { isArray, upperFirst } from 'lodash'

import { RiText } from 'uiBase/text'
import { RiFlexItem, RiRow, RiTabs, TabInfo } from 'uiBase/layout'
import {
  RiEmptyButton,
  RiIconButton,
  RiSelect,
  RiSelectOption,
  defaultValueRender,
} from 'uiBase/forms'
import {
  PlayFilledIcon,
  CancelSlimIcon,
  ExtendIcon,
  ShrinkIcon,
} from 'uiBase/icons'
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

import styles from './styles.module.scss'
import { RiTooltip } from 'uiBase/display'

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
  const { job, name, onClose } = props
  const { loading: isDryRunning, results } = useSelector(rdiDryRunJobSelector)

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [selectedTab, changeSelectedTab] = useState<PipelineJobsTabs>(
    PipelineJobsTabs.Transformations,
  )
  const [input, setInput] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [targetOptions, setTargetOptions] = useState<RiSelectOption[]>([])
  const [selectedTarget, setSelectedTarget] = useState<string>()

  const dispatch = useDispatch()

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
                <RiText>{`${upperFirst(name)} has an invalid structure.`}</RiText>
                <RiText>{msg}</RiText>
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
            <RiText color="subdued" size="s">
              Displays the results of the transformations you defined. The data
              is presented in JSON format.
              <br />
              No data is written to the target database.
            </RiText>
          }
          data-testid="transformation-output-tooltip"
        >
          <RiText>Transformation output</RiText>
        </RiTooltip>
      ),
      content: null,
    },
    {
      value: PipelineJobsTabs.Output,
      label: (
        <RiTooltip
          content={
            <RiText color="subdued" size="s">
              Displays the list of Redis commands that will be generated based
              on your job details.
              <br />
              No data is written to the target database.
            </RiText>
          }
          data-testid="job-output-tooltip"
        >
          <RiText>Job output</RiText>
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
    <div
      className={cx(styles.panel, { [styles.fullScreen]: isFullScreen })}
      data-testid="dry-run-panel"
    >
      <div className={styles.panelInner}>
        <div className={styles.header}>
          <RiText className={styles.title}>Test transformation logic</RiText>
          <div>
            <RiIconButton
              icon={isFullScreen ? ShrinkIcon : ExtendIcon}
              aria-label="toggle fullscrenn dry run panel"
              className={styles.fullScreenBtn}
              onClick={handleFullScreen}
              data-testid="fullScreen-dry-run-btn"
            />
            <RiIconButton
              icon={CancelSlimIcon}
              aria-label="close dry run panel"
              className={styles.closeBtn}
              onClick={onClose}
              data-testid="close-dry-run-btn"
            />
          </div>
        </div>
        <div className={styles.body}>
          <RiText className={styles.text}>
            Add input data to test the transformation logic.
          </RiText>
          <div className={styles.codeLabel}>
            <RiText>Input</RiText>
          </div>
          <MonacoJson
            value={input}
            onChange={setInput}
            disabled={false}
            wrapperClassName={styles.inputCode}
            data-testid="input-value"
          />
          <RiRow responsive justify="end">
            <RiFlexItem>
              <RiTooltip
                content={isFormValid ? null : 'Input should have JSON format'}
                position="top"
              >
                <RiEmptyButton
                  onClick={handleDryRun}
                  icon={PlayFilledIcon}
                  iconSide="right"
                  size="small"
                  disabled={isDryRunning || !isFormValid}
                  loading={isDryRunning}
                  className={cx(styles.actionBtn, styles.runBtn)}
                  data-testid="dry-run-btn"
                >
                  Dry run
                </RiEmptyButton>
              </RiTooltip>
            </RiFlexItem>
          </RiRow>
          <div className={styles.codeLabel}>
            {isSelectAvailable && (
              <RiSelect
                options={targetOptions}
                valueRender={defaultValueRender}
                value={selectedTarget}
                onChange={(value) => setSelectedTarget(value)}
                data-testid="target-select"
              />
            )}
            <RiTabs
              tabs={tabs}
              value={selectedTab}
              onChange={handleTabChange}
              data-testid="pipeline-jobs-tabs"
            />
          </div>
          {selectedTab === PipelineJobsTabs.Transformations && (
            <DryRunJobTransformations />
          )}
          {selectedTab === PipelineJobsTabs.Output && (
            <DryRunJobCommands target={selectedTarget} />
          )}
        </div>
      </div>
    </div>
  )
}

export default DryRunJobPanel
