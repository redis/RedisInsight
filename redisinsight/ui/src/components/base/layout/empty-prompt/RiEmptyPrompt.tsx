import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { useTheme } from '@redis-ui/styles'
import { RiSpacer } from '../spacer'

interface RiEmptyPromptProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
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

export const RiEmptyPrompt = ({
  body,
  title,
  icon,
  ...rest
}: RiEmptyPromptProps) => {
  const theme = useTheme()

  return (
    <StyledEmptyPrompt {...rest}>
      {icon}
      {title && (
        <>
          <RiSpacer size={theme.core.space.space100} />
          {title}
        </>
      )}
      {body && (
        <>
          <RiSpacer size={theme.core.space.space100} />
          {body}
        </>
      )}
    </StyledEmptyPrompt>
  )
}


export default RiEmptyPrompt
