import { EuiAccordion } from '@elastic/eui'
import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isNumber } from 'lodash'
import { RiColorText, RiText } from 'uiBase/text'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { DeleteIcon, EditIcon, PlusIcon, RiIcon } from 'uiBase/icons'
import { RiDestructiveButton, RiIconButton } from 'uiBase/forms'
import { RiLoader, RiTooltip } from 'uiBase/display'
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

import ValidationErrorsList from 'uiSrc/pages/rdi/pipeline-management/components/validation-errors-list/ValidationErrorsList'
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
    <RiRow align="center" gap="s">
      <RiFlexItem>
        <RiIcon type="InfoIcon" />
      </RiFlexItem>
      <RiFlexItem grow>{text}</RiFlexItem>
    </RiRow>
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

  const jobName = (
    name: string,
    isValid: boolean = true,
    validationErrors: string[] = [],
  ) => (
    <>
      <RiFlexItem
        grow
        onClick={() => onSelectedTab(name)}
        className={cx(styles.navItem, 'truncateText', { invalid: !isValid })}
        data-testid={`rdi-nav-job-${name}`}
      >
        {name}

        {!isValid && (
          <RiTooltip
            position="right"
            content={
              <ValidationErrorsList validationErrors={validationErrors} />
            }
          >
            <RiIcon
              type="InfoIcon"
              className="rdi-pipeline-nav__error"
              data-testid="rdi-pipeline-nav__error"
              color="danger500"
            />
          </RiTooltip>
        )}
      </RiFlexItem>
      <RiFlexItem
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
              <RiText size="s">
                Changes will not be applied until the pipeline is deployed.
              </RiText>
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
      </RiFlexItem>
    </>
  )

  const jobNameEditor = (name: string, idx?: number) => (
    <RiFlexItem
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
    </RiFlexItem>
  )

  const isJobValid = (jobName: string) =>
    jobsValidationErrors[jobName]
      ? jobsValidationErrors[jobName].length === 0
      : true

  const getJobValidionErrors = (jobName: string) =>
    jobsValidationErrors[jobName] || []

  const renderJobsList = (jobs: IRdiPipelineJob[]) =>
    jobs.map(({ name }, idx) => (
      <RiRow
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
        <RiRow className={styles.fullWidth} align="center">
          <RiFlexItem>
            <RiIcon
              type="ContractsIcon"
              className={styles.fileIcon}
              data-test-subj="jobs-folder-icon-close"
            />
          </RiFlexItem>
          {currentJobName === name
            ? jobNameEditor(name, idx)
            : jobName(name, isJobValid(name))}
        </RiRow>
      </RiRow>
    ))

  const folder = () => (
    <RiRow className={styles.fullWidth} align="center" justify="between">
      <RiRow className={styles.fullWidth} align="center">
        <RiFlexItem>
          <RiIcon
            type="FolderIcon"
            color={accordionState === 'open' ? 'success300' : 'informative400'}
            className={styles.folderIcon}
            data-test-subj="jobs-folder-icon"
          />
        </RiFlexItem>
        <RiFlexItem grow className="truncateText">
          {'Jobs '}
          {!loading && (
            <RiColorText
              className={styles.jobsCount}
              component="span"
              data-testid="rdi-jobs-count"
            >
              {jobs?.length ? `(${jobs?.length})` : ''}
            </RiColorText>
          )}
          {loading && (
            <RiLoader
              data-testid="rdi-nav-jobs-loader"
              className={styles.loader}
            />
          )}
        </RiFlexItem>
      </RiRow>
    </RiRow>
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
        <RiRow
          className={cx(styles.fullWidth, styles.job)}
          align="center"
          justify="between"
          data-testid="new-job-file"
        >
          <RiRow className={styles.fullWidth} align="center">
            <RiFlexItem>
              <RiIcon
                type="ContractsIcon"
                className={styles.fileIcon}
                data-test-subj="jobs-file-icon"
              />
            </RiFlexItem>
            {jobNameEditor('')}
          </RiRow>
        </RiRow>
      )}
      {renderJobsList(jobs ?? [])}
    </EuiAccordion>
  )
}

export default JobsTree
