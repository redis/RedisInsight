import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface RiEmptyPromptProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  body?: React.ReactNode
  title?: React.ReactNode
  icon?: React.ReactNode
}

const StyledEmptyPrompt = styled.div`
  max-width: 36em;
  text-align: center;
  padding: 24px;
  margin: auto;
`

const Spacer = styled.div`
  height: ${({ theme }) => theme.core.space.space100};
`

const RiEmptyPrompt = ({ body, title, icon }: RiEmptyPromptProps) => (
  <StyledEmptyPrompt>
    {icon}
    {title && (
      <>
        <Spacer />
        {title}
      </>
    )}
    {body && (
      <>
        <Spacer />
        {body}
      </>
    )}
  </StyledEmptyPrompt>
)

export default RiEmptyPrompt
