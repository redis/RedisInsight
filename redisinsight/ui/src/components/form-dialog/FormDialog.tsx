import React from 'react'

import { Nullable } from 'uiSrc/utils'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Modal } from 'uiSrc/components/base/display'

import { StyledFormDialogContent } from './FormDialog.styles'

export interface Props {
  isOpen: boolean
  onClose: () => void
  header: Nullable<React.ReactNode>
  footer?: Nullable<React.ReactNode>
  children: Nullable<React.ReactNode>
  className?: string
}

const FormDialog = (props: Props) => {
  const { isOpen, onClose, header, footer, children, className = '' } = props

  if (!isOpen) return null

  return (
    <Modal.Compose open={isOpen}>
      <StyledFormDialogContent
        persistent
        className={className}
        onCancel={onClose}
      >
        <Modal.Content.Close icon={CancelIcon} onClick={onClose} />
        <Modal.Content.Header.Title>{header}</Modal.Content.Header.Title>
        <Modal.Content.Body content={children} />
        <Modal.Content.Footer.Compose>{footer}</Modal.Content.Footer.Compose>
      </StyledFormDialogContent>
    </Modal.Compose>
  )
}

export default FormDialog
