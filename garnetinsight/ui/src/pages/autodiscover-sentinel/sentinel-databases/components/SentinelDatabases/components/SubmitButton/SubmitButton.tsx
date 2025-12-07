import React from 'react'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components/base'
import validationErrors from 'uiSrc/constants/validationErrors'

import { type SubmitButtonProps } from './SubmitButton.types'

const TooltipIcon = ({ title, content }: { title: string | null; content: string | null }) => (
  <RiTooltip position="top" title={title} content={<span>{content}</span>}>
    <RiIcon type="InfoIcon" />
  </RiTooltip>
)

export const SubmitButton = ({
  selection,
  loading,
  onClick,
  isDisabled,
}: SubmitButtonProps) => {
  let title: string | null = null
  let content: string | null = null
  const emptyAliases = selection.filter(({ alias }) => !alias)

  if (selection.length < 1) {
    title = validationErrors.SELECT_AT_LEAST_ONE('primary group')
    content = validationErrors.NO_PRIMARY_GROUPS_SENTINEL
  }

  if (emptyAliases.length !== 0) {
    title = validationErrors.REQUIRED_TITLE(emptyAliases.length)
    content = 'Database Alias'
  }

  return (
    <PrimaryButton
      type="submit"
      onClick={onClick}
      disabled={isDisabled}
      loading={loading}
      icon={isDisabled ? () => <TooltipIcon title={title} content={content} /> : undefined}
      data-testid="btn-add-primary-group"
    >
      Add Primary Group
    </PrimaryButton>
  )
}

