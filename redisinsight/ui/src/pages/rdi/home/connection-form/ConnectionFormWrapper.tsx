import React, { useState } from 'react'
import { FormDialog } from 'uiSrc/components'
import { Title } from 'uiSrc/components/base/text/Title'
import { Nullable } from 'uiSrc/utils'
import { ModalHeaderProvider } from 'uiSrc/contexts/ModalTitleProvider'
import ConnectionForm, { Props as ConnectionFormProps } from './ConnectionForm'

import styles from './styles.module.scss'
import { FooterDatabaseForm } from 'uiSrc/components/form-dialog/FooterDatabaseForm'

export interface Props extends ConnectionFormProps {
  isOpen: boolean
}

const ConnectionFormWrapper = (props: Props) => {
  const { isOpen, onCancel } = props
  const [modalHeader, setModalHeader] =
    useState<Nullable<React.ReactNode>>(null)

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onCancel}
      header={modalHeader ?? <Title size="M">Add endpoint</Title>}
      footer={<FooterDatabaseForm />}
    >
      <div className={styles.bodyWrapper}>
        <ModalHeaderProvider value={{ modalHeader, setModalHeader }}>
          <ConnectionForm {...props} />
        </ModalHeaderProvider>
      </div>
    </FormDialog>
  )
}

export default ConnectionFormWrapper
