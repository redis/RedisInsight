import React, { useState } from 'react'
import { FormDialog } from 'uiSrc/components'
import { Title } from 'uiSrc/components/base/text/Title'
import { Nullable } from 'uiSrc/utils'
import { ModalHeaderProvider } from 'uiSrc/contexts/ModalTitleProvider'
import { useTranslation } from 'uiSrc/i18n'
import ConnectionForm, { Props as ConnectionFormProps } from './ConnectionForm'

import { FooterDatabaseForm } from 'uiSrc/components/form-dialog/FooterDatabaseForm'

export interface Props extends ConnectionFormProps {
  isOpen: boolean
}

const ConnectionFormWrapper = (props: Props) => {
  const { isOpen, onCancel } = props
  const { t } = useTranslation()
  const [modalHeader, setModalHeader] =
    useState<Nullable<React.ReactNode>>(null)

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onCancel}
      header={
        modalHeader ?? <Title size="M">{t('rdi.home.form.wrapperTitle')}</Title>
      }
      footer={<FooterDatabaseForm />}
    >
      <ModalHeaderProvider value={{ modalHeader, setModalHeader }}>
        <ConnectionForm {...props} />
      </ModalHeaderProvider>
    </FormDialog>
  )
}

export default ConnectionFormWrapper
