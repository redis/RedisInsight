import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isNumber } from 'lodash'

import { PageNames } from 'uiSrc/constants'
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

import { Row } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { PlusIcon } from 'uiSrc/components/base/icons'

import BaseCard, { BaseCardProps } from '../BaseCard'
import JobNameForm from './JobNameForm'
import JobItem from './JobsItem'
import { useLocation, useParams } from 'react-router-dom'

export type JobsCardProps = Omit<
  BaseCardProps,
  'title' | 'children' | 'onSelect'
> & {
  onSelect: (id: string) => void
}

const JobsCard = (props: JobsCardProps) => {
  const { onSelect, isSelected } = props

  const [currentJobName, setCurrentJobName] = useState<Nullable<string>>(null)
  const [isNewJob, setIsNewJob] = useState(false)
  const [hideTooltip, setHideTooltip] = useState(false)

  const {
    loading,
    data,
    jobs = [],
    jobsValidationErrors,
    changes = {},
  } = useSelector(rdiPipelineSelector)

  const dispatch = useDispatch()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { pathname } = useLocation()

  const path = decodeURIComponent(pathname?.split('/').pop() || '')

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
    const updatedJobs: IRdiPipelineJob[] = isJobExists
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

  const isJobValid = (jobName: string) =>
    jobsValidationErrors[jobName]
      ? jobsValidationErrors[jobName].length === 0
      : true

  const getJobValidationErrors = (jobName: string) =>
    jobsValidationErrors[jobName] || []

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
          <Row align="center">
            <JobNameForm
              name=""
              idx={undefined}
              currentJobName={currentJobName}
              jobs={jobs}
              isLoading={loading}
              onApply={handleApplyJobName}
              onDecline={handleDeclineJobName}
            />
          </Row>
        </Row>
      )}

      {jobs.map(({ name }, idx) => (
        <Row
          key={name}
          align="center"
          justify="between"
          data-testid={`job-file-${name}`}
        >
          {currentJobName === name ? (
            <JobNameForm
              name={name}
              idx={idx}
              currentJobName={currentJobName}
              jobs={jobs}
              isLoading={loading}
              onApply={handleApplyJobName}
              onDecline={handleDeclineJobName}
            />
          ) : (
            <JobItem
              name={name}
              isValid={isJobValid(name)}
              validationErrors={getJobValidationErrors(name)}
              isActive={path === name}
              hasChanges={!!changes[name]}
              onSelect={onSelect}
              onEdit={(jobName) => {
                setCurrentJobName(jobName)
                setIsNewJob(false)
              }}
              onDelete={handleDeleteClick}
            />
          )}
        </Row>
      ))}
    </BaseCard>
  )
}

export default JobsCard
