import React from 'react'
import cx from 'classnames'

import { Nullable } from 'uiSrc/utils'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { RiModal } from 'uiSrc/components/base/display'
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
    <RiModal.Compose open={isOpen}>
      <RiModal.Content.Compose
        persistent
        className={cx(styles.modal, className)}
        onCancel={onClose}
      >
        <RiModal.Content.Close icon={CancelIcon} onClick={onClose} />
        <RiModal.Content.Header.Title>{header}</RiModal.Content.Header.Title>
        <RiModal.Content.Body content={children} />
        <RiModal.Content.Footer.Compose>
          {footer}
        </RiModal.Content.Footer.Compose>
      </RiModal.Content.Compose>
    </RiModal.Compose>
  )
}

export default FormDialog
