import React from 'react'

import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { IRdiPipelineJob } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import i18n from 'uiSrc/i18n'

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
  // Validation messages are displayed by RiTooltip
  // and we don't want them to have a title
  // TODO: refactor this (inline editor should be responsible for displaying errors)
  // only the message should be provided from this component
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
    return buildValidationMessage(i18n.t('rdi.pipeline.jobName.required'))
  }

  if (jobName === currentJobName) return undefined

  if (jobs.some((job) => job.name === jobName)) {
    return buildValidationMessage(i18n.t('rdi.pipeline.jobName.inUse'))
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
      placeholder={i18n.t('rdi.pipeline.jobName.placeholder')}
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
