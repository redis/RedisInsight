import React from 'react'
import AzureConnectionForm from './AzureConnectionForm'

export interface Props {
  onClose?: () => void
}

const AzureConnectionFormWrapper = (props: Props) => {
  const { onClose } = props

  return <AzureConnectionForm onClose={onClose} />
}

export default AzureConnectionFormWrapper

