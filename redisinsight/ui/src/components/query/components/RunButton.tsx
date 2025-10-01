import React from 'react'
import styled from 'styled-components'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

const StyledEmptyButton = styled(EmptyButton)`
  height: 24px !important;
  min-width: auto !important;
  min-height: auto !important;
  border-radius: 4px !important;
  background: transparent !important;
  box-shadow: none !important;
  margin-left: 8px;

  border: 1px solid transparent !important;

  & .RI-flex-row {
    padding: 0 6px;
  }

  &:focus,
  &:active {
    outline: 0 !important;
  }

  svg {
    margin-top: 1px;
    width: 14px;
    height: 14px;
    color: var(--rsSubmitBtn) !important;
  }
`

export const RunButton = ({
  isLoading,
  onSubmit,
}: {
  isLoading?: boolean
  onSubmit: () => void
}) => {
  return (
    <StyledEmptyButton
      onClick={() => {
        onSubmit()
      }}
      loading={isLoading}
      disabled={isLoading}
      icon={PlayFilledIcon}
      aria-label="submit"
      data-testid="btn-submit"
    >
      Run
    </StyledEmptyButton>
  )
}

export default RunButton
