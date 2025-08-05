import React from 'react'
import { useHistory } from 'react-router-dom'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'

export interface Props {
  path: string
  text: string
  dataTestid?: string
  onClick?: () => void
}

const InternalLink = (props: Props) => {
  const { path, text, onClick, dataTestid } = props

  const history = useHistory()

  const handleClick = () => {
    // can replace parameters here if needed (instanceId or rdiInstanceId)
    history.push(path)
    onClick?.()
  }
  return (
    <RiPrimaryButton
      size="s"
      onClick={handleClick}
      data-testid={dataTestid || 'internal-link'}
    >
      {text}
    </RiPrimaryButton>
  )
}

export default InternalLink
