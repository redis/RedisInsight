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
import { isEqualPipelineFile, Nullable, truncateText } from 'uiSrc/utils'

import { Text } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  DeleteIcon,
  EditIcon,
  Icon,
  PlusIcon,
} from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import {
  DestructiveButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import ValidationErrorsList from 'uiSrc/pages/rdi/pipeline-management/components/validation-errors-list/ValidationErrorsList'
import { Indicator } from 'uiSrc/components/base/text/text.styles'
import { ToastNotificationIcon } from '@redis-ui/icons'
import BaseCard, { BaseCardProps } from './BaseCard'

// TODO: Check the API
type JobsCardProps = Omit<BaseCardProps, 'title' | 'children' | 'onSelect'> & {
  onSelect: (id: string) => void
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

// TODO: Refactor this component
const JobsCard = (props: JobsCardProps) => {
  const { onSelect, path, rdiInstanceId, changes = {}, isSelected } = props

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
      onSelect(newJobs.length ? newJobs[0].name : PageNames.rdiPipelineConfig)
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
      onSelect(value)
    }
  }

  const jobRow = (
    name: string,
    isValid: boolean = true,
    validationErrors: string[] = [],
    isActive: boolean,
  ) => (
    <Row align="center" gap="s">
      {/* Modification indicator */}
      <FlexItem>
        {!!changes[name] && (
          <RiTooltip
            content="This file contains undeployed changes."
            position="top"
          >
            <Indicator
              $color="informative"
              data-testid={`updated-file-${name}-highlight`}
            />
          </RiTooltip>
        )}
      </FlexItem>
      {/* Job name and validation icon */}
      <FlexItem
        onClick={() => onSelect(name)}
        data-testid={`rdi-nav-job-${name}`}
        grow
      >
        <Row align="center" gap="m">
          <RiTooltip content={truncateText(name, 200)}>
            <Text
              style={{ textDecoration: isActive ? 'underline' : 'none' }}
              color={isActive ? 'primary' : 'secondary'}
            >
              {truncateText(name, 20)}
            </Text>
          </RiTooltip>
          {!isValid && (
            <RiTooltip
              position="right"
              content={
                <ValidationErrorsList validationErrors={validationErrors} />
              }
            >
              <Icon
                icon={ToastNotificationIcon}
                data-testid="rdi-pipeline-nav__error"
                color="danger500"
                size="M"
              />
            </RiTooltip>
          )}
        </Row>
      </FlexItem>
      {/* Actions */}
      <FlexItem>
        <Row data-testid={`rdi-nav-job-actions-${name}`} align="center">
          <RiTooltip content="Edit job file name" position="top">
            <IconButton
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
                <DestructiveButton
                  size="s"
                  color="secondary"
                  data-testid="delete-confirm-btn"
                >
                  Delete
                </DestructiveButton>
              }
              onConfirm={() => handleDeleteClick(name)}
              button={
                <IconButton
                  icon={DeleteIcon}
                  aria-label="delete job"
                  data-testid={`delete-job-${name}`}
                />
              }
            />
          </RiTooltip>
        </Row>
      </FlexItem>
    </Row>
  )

  const jobNameEditor = (name: string, idx?: number) => (
    <FlexItem grow data-testid={`rdi-nav-job-edit-${name}`}>
      <InlineItemEditor
        controlsPosition="bottom"
        onApply={(value: string) => handleApplyJobName(value, idx)}
        onDecline={handleDeclineJobName}
        disableByValidation={(value) =>
          !!validateJobName(value, currentJobName, jobs)
        }
        getError={(value) => validateJobName(value, currentJobName, jobs)}
        isLoading={loading}
        declineOnUnmount={false}
        initialValue={currentJobName || ''}
        placeholder="Enter job name"
        maxLength={250}
        viewChildrenMode={false}
        disableEmpty
        variant="underline"
        styles={{
          input: {
            height: '32px',
          },
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

  const getJobValidionErrors = (jobName: string) =>
    jobsValidationErrors[jobName] || []

  const renderJobsList = (jobs: IRdiPipelineJob[]) =>
    jobs.map(({ name }, idx) => (
      <Row
        key={name}
        // isActive = path === name
        align="center"
        justify="between"
        data-testid={`job-file-${name}`}
      >
        <div></div>
        {currentJobName === name
          ? jobNameEditor(name, idx)
          : jobRow(
              name,
              isJobValid(name),
              getJobValidionErrors(name),
              path === name,
            )}
      </Row>
    ))

  return (
    <BaseCard
      title="Transform and Validate"
      titleActions={
        <RiTooltip
          content={!hideTooltip ? 'Add a job file' : null}
          position="top"
          anchorClassName="flex-row"
        >
          <IconButton
            icon={PlusIcon}
            onClick={() => {
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
      isSelected={isSelected}
      data-testid="rdi-pipeline-jobs-nav"
    >
      {isNewJob && (
        <Row align="center" justify="between" data-testid="new-job-file">
          <Row align="center">{jobNameEditor('')}</Row>
        </Row>
      )}
      {renderJobsList(jobs ?? [])}
    </BaseCard>
  )
}

export default JobsCard
