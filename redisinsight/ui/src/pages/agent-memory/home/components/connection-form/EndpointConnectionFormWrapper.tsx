import React, { useState } from 'react'

import { FormDialog } from 'uiSrc/components'
import { Title } from 'uiSrc/components/base/text/Title'
import { Nullable } from 'uiSrc/utils'
import { ModalHeaderProvider } from 'uiSrc/contexts/ModalTitleProvider'
import { FooterDatabaseForm } from 'uiSrc/components/form-dialog/FooterDatabaseForm'
import EndpointConnectionForm, {
  EndpointConnectionFormProps,
} from './EndpointConnectionForm'

export interface EndpointConnectionFormWrapperProps
  extends EndpointConnectionFormProps {
  isOpen: boolean
}

const EndpointConnectionFormWrapper = (
  props: EndpointConnectionFormWrapperProps,
) => {
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
      <ModalHeaderProvider value={{ modalHeader, setModalHeader }}>
        <EndpointConnectionForm {...props} />
      </ModalHeaderProvider>
    </FormDialog>
  )
}

export default EndpointConnectionFormWrapper
