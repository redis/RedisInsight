import React from 'react'
import styled from 'styled-components'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

const StyledEmptyButton = styled(EmptyButton)`
  &:focus,
  &:active {
    outline: 0;
  }

  svg {
    margin-top: 1px;
    width: 14px;
    height: 14px;
    color: var(--rsSubmitBtn);
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
