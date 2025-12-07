import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { throttle } from 'lodash'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import {
  deleteChangedFile,
  fetchPipelineStrategies,
  rdiPipelineSelector,
  setChangedFile,
  setPipelineJobs,
  updatePipelineJob,
} from 'uiSrc/slices/rdi/pipeline'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import MonacoYaml from 'uiSrc/components/monaco-editor/components/monaco-yaml'
import DryRunJobPanel from 'uiSrc/pages/rdi/pipeline-management/components/jobs-panel'
import { rdiErrorMessages } from 'uiSrc/pages/rdi/constants'
import { DSL, KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import {
  createAxiosError,
  isEqualPipelineFile,
  Maybe,
  yamlToJson,
} from 'uiSrc/utils'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { KeyboardShortcut, RiTooltip } from 'uiSrc/components'

import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text, Title } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'
import TemplateButton from '../../components/template-button'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Link, TextButton } from '@redis-ui/components'
import { StyledRdiJobConfigContainer } from 'uiSrc/pages/rdi/pipeline-management/pages/job/styles'

export interface Props {
  name: string
  value: string
  deployedJobValue: Maybe<string>
  jobIndex: number
  rdiInstanceId: string
}

const Job = (props: Props) => {
  const { name, value = '', deployedJobValue, jobIndex, rdiInstanceId } = props

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [shouldOpenDedicatedEditor, setShouldOpenDedicatedEditor] =
    useState<boolean>(false)

  const dispatch = useDispatch()

  const jobIndexRef = useRef<number>(jobIndex)
  const deployedJobValueRef = useRef<Maybe<string>>(deployedJobValue)
  const jobNameRef = useRef<string>(name)

  const { loading, monacoJobsSchema, jobFunctions, jobs } =
    useSelector(rdiPipelineSelector)

  useEffect(() => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
  }, [])

  useEffect(() => {
    setIsPanelOpen(false)
  }, [name])

  useEffect(() => {
    deployedJobValueRef.current = deployedJobValue
  }, [deployedJobValue])

  useEffect(() => {
    jobIndexRef.current = jobIndex
  }, [jobIndex])

  useEffect(() => {
    jobNameRef.current = name
  }, [name])

  const handleDryRunJob = () => {
    const JSONValue = yamlToJson(value, (msg) => {
      dispatch(
        addErrorNotification(
          createAxiosError({
            message: rdiErrorMessages.invalidStructure(name, msg),
          }),
        ),
      )
    })
    if (!JSONValue) {
      return
    }
    setIsPanelOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEST_JOB_OPENED,
      eventData: {
        id: rdiInstanceId,
      },
    })
  }

  const checkIsFileUpdated = useCallback(
    throttle((value) => {
      if (!deployedJobValueRef.current) {
        return
      }

      if (isEqualPipelineFile(value, deployedJobValueRef.current)) {
        dispatch(deleteChangedFile(jobNameRef.current))
        return
      }
      dispatch(
        setChangedFile({
          name: jobNameRef.current,
          status: FileChangeType.Modified,
        }),
      )
    }, 2000),
    [deployedJobValue, jobNameRef.current],
  )

  const handleChange = (value: string) => {
    dispatch(updatePipelineJob({ name: jobNameRef.current, value }))
    checkIsFileUpdated(value)
  }

  const handleChangeLanguage = (langId: DSL) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_LANGUAGE_CHANGED,
      eventData: {
        rdiInstanceId,
        selectedLanguageSyntax: langId,
      },
    })
  }

  const handleOpenDedicatedEditor = () => {
    setShouldOpenDedicatedEditor(false)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_OPENED,
      eventData: {
        rdiInstanceId,
      },
    })
  }

  const handleCloseDedicatedEditor = (langId: DSL) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_CANCELLED,
      eventData: {
        rdiInstanceId,
        selectedLanguageSyntax: langId,
      },
    })
  }

  const handleSubmitDedicatedEditor = (langId: DSL) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_SAVED,
      eventData: {
        rdiInstanceId,
        selectedLanguageSyntax: langId,
      },
    })
  }

  return (
    <Row>
      <StyledRdiJobConfigContainer grow>
        <Col gap="m">
          <Row grow={false} align="center" justify="between">
            <Title size="S" color="primary">
              {name}
            </Title>
            <FlexItem>
              <Row gap="l">
                <RiTooltip
                  position="top"
                  content={
                    KEYBOARD_SHORTCUTS?.rdi?.openDedicatedEditor && (
                      <div>
                        <Text size="s">{`${KEYBOARD_SHORTCUTS.rdi.openDedicatedEditor?.description}\u00A0\u00A0`}</Text>
                        <KeyboardShortcut
                          separator={KEYBOARD_SHORTCUTS?._separator}
                          items={
                            KEYBOARD_SHORTCUTS.rdi.openDedicatedEditor.keys
                          }
                        />
                      </div>
                    )
                  }
                  data-testid="open-dedicated-editor-tooltip"
                >
                  <TextButton
                    onClick={() => setShouldOpenDedicatedEditor(true)}
                    data-testid="open-dedicated-editor-btn"
                    variant="primary-inline"
                  >
                    SQL and JMESPath Editor
                  </TextButton>
                </RiTooltip>
                <TemplateButton
                  value={value}
                  setFieldValue={(template) => {
                    const newJobs = jobs.map((job, index) => {
                      if (index === jobIndexRef.current) {
                        return {
                          ...job,
                          value: template,
                        }
                      }
                      return job
                    })
                    dispatch(setPipelineJobs(newJobs))
                  }}
                />
              </Row>
            </FlexItem>
          </Row>
          <Text color="primary">
            {'Create a job per source table to filter, transform, and '}
            <Link
              data-testid="rdi-pipeline-transformation-link"
              target="_blank"
              href={getUtmExternalLink(EXTERNAL_LINKS.rdiPipelineTransforms, {
                medium: UTM_MEDIUMS.Rdi,
                campaign: 'job_file',
              })}
              variant="inline"
            >
              map data
            </Link>
            {' to Redis.'}
          </Text>
          {loading ? (
            <div data-testid="rdi-job-loading">
              <Loader color="secondary" size="l" loaderText="Loading..." />
            </div>
          ) : (
            <MonacoYaml
              schema={monacoJobsSchema}
              value={value}
              onChange={handleChange}
              disabled={loading}
              dedicatedEditorLanguages={[DSL.sqliteFunctions, DSL.jmespath]}
              dedicatedEditorFunctions={
                jobFunctions as monacoEditor.languages.CompletionItem[]
              }
              dedicatedEditorOptions={{
                suggest: {
                  preview: false,
                  showIcons: true,
                  showStatusBar: true,
                },
              }}
              onChangeLanguage={handleChangeLanguage}
              shouldOpenDedicatedEditor={shouldOpenDedicatedEditor}
              onOpenDedicatedEditor={handleOpenDedicatedEditor}
              onCloseDedicatedEditor={handleCloseDedicatedEditor}
              onSubmitDedicatedEditor={handleSubmitDedicatedEditor}
              data-testid="rdi-monaco-job"
              fullHeight
            />
          )}
          <Row grow={false} justify="end">
            <PrimaryButton
              color="secondary"
              onClick={handleDryRunJob}
              disabled={isPanelOpen}
              data-testid="rdi-job-dry-run"
            >
              Dry Run
            </PrimaryButton>
          </Row>
        </Col>
      </StyledRdiJobConfigContainer>
      {isPanelOpen && (
        <FlexItem>
          <DryRunJobPanel
            onClose={() => setIsPanelOpen(false)}
            job={value}
            name={name}
          />
        </FlexItem>
      )}
    </Row>
  )
}

export default Job
