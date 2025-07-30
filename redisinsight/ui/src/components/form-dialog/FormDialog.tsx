import React from 'react'

import { Nullable } from 'uiSrc/utils'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Modal } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

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
      <Modal.Content.Compose
        persistent
        className={`${styles.modal} ${className}`}
        onCancel={onClose}
      >
        <Modal.Content.Close icon={CancelIcon} onClick={onClose} />
        <Modal.Content.Header.Title>{header}</Modal.Content.Header.Title>
        <Modal.Content.Body content={children} />
        <Modal.Content.Footer.Compose>{footer}</Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default FormDialog
