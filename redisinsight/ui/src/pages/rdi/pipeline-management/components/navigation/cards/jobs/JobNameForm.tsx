import React from 'react'

import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { IRdiPipelineJob } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

type JobNameFormProps = {
  name: string
  idx?: number
  currentJobName: Nullable<string>
  jobs: IRdiPipelineJob[]
  isLoading: boolean
  onApply: (value: string, idx?: number) => void
  onDecline: () => void
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

const JobNameForm = ({
  name,
  idx,
  currentJobName,
  jobs,
  isLoading,
  onApply,
  onDecline,
}: JobNameFormProps) => (
  <FlexItem grow data-testid={`rdi-nav-job-edit-${name}`}>
    <InlineItemEditor
      controlsPosition="bottom"
      onApply={(value: string) => onApply(value, idx)}
      onDecline={onDecline}
      disableByValidation={(value) =>
        !!validateJobName(value, currentJobName, jobs)
      }
      getError={(value) => validateJobName(value, currentJobName, jobs)}
      isLoading={isLoading}
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

export default JobNameForm
