import { EuiAccordion } from '@elastic/eui'
import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isNumber } from 'lodash'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { PageNames } from 'uiSrc/constants'
import ConfirmationPopover from 'uiSrc/pages/rdi/components/confirmation-popover/ConfirmationPopover'
import { FileChangeType, IRdiPipelineJob } from 'uiSrc/slices/interfaces'
import {
  deleteChangedFile,
  deletePipelineJob,
  rdiPipelineSelector,
  setChangedFile,
  setPipelineJobs,
} from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isEqualPipelineFile, Nullable } from 'uiSrc/utils'

import { ColorText, Text } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  DeleteIcon,
  EditIcon,
  PlusIcon,
  RiIcon,
} from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { RiDestructiveButton, RiIconButton } from 'uiSrc/components/base/forms'
import { RiLoader } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

export interface IProps {
  onSelectedTab: (id: string) => void
  path: string
  rdiInstanceId: string
  changes: Record<string, FileChangeType>
}

const buildValidationMessage = (text: string) => ({
  title: '',
  content: (
    <Row align="center" gap="s">
      <FlexItem>
        <RiIcon type="InfoIcon" />
      </FlexItem>
      <FlexItem grow>{text}</FlexItem>
    </Row>
  ),
})

const validateJobName = (
  jobName: string,
  currentJobName: Nullable<string>,
  jobs: IRdiPipelineJob[],
) => {
  if (!jobName) {
    return buildValidationMessage('Job name is required')
  }

  if (jobName === currentJobName) return undefined

  if (jobs.some((job) => job.name === jobName)) {
    return buildValidationMessage('Job name is already in use')
  }

  return undefined
}

const JobsTree = (props: IProps) => {
  const { onSelectedTab, path, rdiInstanceId, changes = {} } = props

  const [accordionState, setAccordionState] = useState<'closed' | 'open'>(
    'open',
  )
  const [currentJobName, setCurrentJobName] = useState<Nullable<string>>(null)
  const [isNewJob, setIsNewJob] = useState(false)
  const [hideTooltip, setHideTooltip] = useState(false)

  const { loading, data, jobs, jobsValidationErrors } =
    useSelector(rdiPipelineSelector)

  const dispatch = useDispatch()

  const handleDeleteClick = (name: string) => {
    dispatch(deletePipelineJob(name))

    const newJobs = jobs.filter((el) => el.name !== name)
    dispatch(setPipelineJobs(newJobs))

    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_JOB_DELETED,
      eventData: {
        rdiInstanceId,
        jobName: name,
      },
    })

    // if the last job is deleted, select the pipeline config tab
    if (path === name) {
      onSelectedTab(
        newJobs.length ? newJobs[0].name : PageNames.rdiPipelineConfig,
      )
    }
  }

  const handleDeclineJobName = () => {
    setCurrentJobName(null)

    if (isNewJob) {
      setIsNewJob(false)
    }
  }

  const handleApplyJobName = (value: string, idx?: number) => {
    const isJobExists = isNumber(idx)
    const updatedJobs = isJobExists
      ? [
          ...jobs.slice(0, idx),
          { ...jobs[idx], name: value },
          ...jobs.slice(idx + 1),
        ]
      : [...jobs, { name: value, value: '' }]

    dispatch(setPipelineJobs(updatedJobs))

    const deployedJob = data?.jobs.find((el) => el.name === value)

    if (!deployedJob) {
      dispatch(setChangedFile({ name: value, status: FileChangeType.Added }))
    }

    if (
      deployedJob &&
      isJobExists &&
      isEqualPipelineFile(jobs[idx].value, deployedJob.value)
    ) {
      dispatch(deleteChangedFile(deployedJob.value))
    }

    setCurrentJobName(null)
    setIsNewJob(false)

    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_JOB_CREATED,
      eventData: {
        rdiInstanceId,
        jobName: value,
      },
    })

    if (path === currentJobName) {
      onSelectedTab(value)
    }
  }

  const handleToggleAccordion = (isOpen: boolean) =>
    setAccordionState(isOpen ? 'open' : 'closed')

  const jobName = (name: string, isValid: boolean = true) => (
    <>
      <FlexItem
        grow
        onClick={() => onSelectedTab(name)}
        className={cx(styles.navItem, 'truncateText', { invalid: !isValid })}
        data-testid={`rdi-nav-job-${name}`}
      >
        {name}

        {!isValid && (
          <RiIcon
            type="IndicatorXIcon"
            className="rdi-pipeline-nav__error"
            data-testid="rdi-pipeline-nav__error"
          />
        )}
      </FlexItem>
      <FlexItem
        className={styles.actions}
        data-testid={`rdi-nav-job-actions-${name}`}
      >
        <RiTooltip
          content="Edit job file name"
          position="top"
          anchorClassName="flex-row"
        >
          <RiIconButton
            icon={EditIcon}
            onClick={() => {
              setCurrentJobName(name)
              setIsNewJob(false)
            }}
            aria-label="edit job file name"
            data-testid={`edit-job-name-${name}`}
          />
        </RiTooltip>
        <RiTooltip
          content="Delete job"
          position="top"
          anchorClassName="flex-row"
        >
          <ConfirmationPopover
            title={`Delete ${name}`}
            body={
              <Text size="s">
                Changes will not be applied until the pipeline is deployed.
              </Text>
            }
            submitBtn={
              <RiDestructiveButton
                size="s"
                color="secondary"
                data-testid="delete-confirm-btn"
              >
                Delete
              </RiDestructiveButton>
            }
            onConfirm={() => handleDeleteClick(name)}
            button={
              <RiIconButton
                icon={DeleteIcon}
                aria-label="delete job"
                data-testid={`delete-job-${name}`}
              />
            }
          />
        </RiTooltip>
      </FlexItem>
    </>
  )

  const jobNameEditor = (name: string, idx?: number) => (
    <FlexItem
      grow
      className={styles.inputContainer}
      data-testid={`rdi-nav-job-edit-${name}`}
    >
      <InlineItemEditor
        controlsPosition="right"
        onApply={(value: string) => handleApplyJobName(value, idx)}
        onDecline={handleDeclineJobName}
        disableByValidation={(value) =>
          !!validateJobName(value, currentJobName, jobs)
        }
        getError={(value) => validateJobName(value, currentJobName, jobs)}
        isLoading={loading}
        declineOnUnmount={false}
        controlsClassName={styles.inputControls}
        initialValue={currentJobName || ''}
        placeholder="Enter job name"
        maxLength={250}
        textFiledClassName={styles.input}
        viewChildrenMode={false}
        disableEmpty
        styles={{
          actionsContainer: {
            width: '64px',
          },
        }}
      />
    </FlexItem>
  )

  const isJobValid = (jobName: string) =>
    jobsValidationErrors[jobName]
      ? jobsValidationErrors[jobName].length === 0
      : true

  const renderJobsList = (jobs: IRdiPipelineJob[]) =>
    jobs.map(({ name }, idx) => (
      <Row
        key={name}
        className={cx(styles.fullWidth, styles.job, {
          [styles.active]: path === name,
        })}
        align="center"
        justify="between"
        data-testid={`job-file-${name}`}
      >
        <div className={styles.dotWrapper}>
          {!!changes[name] && (
            <RiTooltip
              content="This file contains undeployed changes."
              position="top"
              anchorClassName={styles.dotWrapper}
            >
              <span className={styles.dotWrapper}>
                <span
                  className={styles.dot}
                  data-testid={`updated-file-${name}-highlight`}
                />
              </span>
            </RiTooltip>
          )}
        </div>
        <Row className={styles.fullWidth} align="center">
          <FlexItem>
            <RiIcon
              type="ContractsIcon"
              className={styles.fileIcon}
              data-test-subj="jobs-folder-icon-close"
            />
          </FlexItem>
          {currentJobName === name
            ? jobNameEditor(name, idx)
            : jobName(name, isJobValid(name))}
        </Row>
      </Row>
    ))

  const folder = () => (
    <Row className={styles.fullWidth} align="center" justify="between">
      <Row className={styles.fullWidth} align="center">
        <FlexItem>
          <RiIcon
            type="FolderIcon"
            color={accordionState === 'open' ? 'success300' : 'informative400'}
            className={styles.folderIcon}
            data-test-subj="jobs-folder-icon"
          />
        </FlexItem>
        <FlexItem grow className="truncateText">
          {'Jobs '}
          {!loading && (
            <ColorText
              className={styles.jobsCount}
              component="span"
              data-testid="rdi-jobs-count"
            >
              {jobs?.length ? `(${jobs?.length})` : ''}
            </ColorText>
          )}
          {loading && (
            <RiLoader
              data-testid="rdi-nav-jobs-loader"
              className={styles.loader}
            />
          )}
        </FlexItem>
      </Row>
    </Row>
  )

  return (
    <EuiAccordion
      id="rdi-pipeline-jobs-nav"
      buttonContent={folder()}
      onToggle={handleToggleAccordion}
      className={styles.wrapper}
      forceState={accordionState}
      extraAction={
        <RiTooltip
          content={!hideTooltip ? 'Add a job file' : null}
          position="top"
          anchorClassName="flex-row"
        >
          <RiIconButton
            icon={PlusIcon}
            onClick={() => {
              setAccordionState('open')
              setIsNewJob(true)
            }}
            onMouseEnter={() => {
              setHideTooltip(false)
            }}
            onMouseLeave={() => {
              setHideTooltip(true)
            }}
            disabled={isNewJob}
            aria-label="add new job file"
            data-testid="add-new-job"
          />
        </RiTooltip>
      }
    >
      {/* // TODO confirm with RDI team and put sort in separate component */}
      {isNewJob && (
        <Row
          className={cx(styles.fullWidth, styles.job)}
          align="center"
          justify="between"
          data-testid="new-job-file"
        >
          <Row className={styles.fullWidth} align="center">
            <FlexItem>
              <RiIcon
                type="ContractsIcon"
                className={styles.fileIcon}
                data-test-subj="jobs-file-icon"
              />
            </FlexItem>
            {jobNameEditor('')}
          </Row>
        </Row>
      )}
      {renderJobsList(jobs ?? [])}
    </EuiAccordion>
  )
}

export default JobsTree
