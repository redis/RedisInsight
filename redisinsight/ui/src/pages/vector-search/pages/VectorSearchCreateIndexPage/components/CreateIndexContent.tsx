import React from 'react'

import { IndexDetails } from '../../../components/index-details'
import { IndexDetailsMode } from '../../../components/index-details/IndexDetails.types'
import { CommandView } from '../../../components/command-view'
import { FieldTypeModal } from '../../../components/field-type-modal'

import { CreateIndexTab } from '../VectorSearchCreateIndexPage.types'
import { useCreateIndexPage } from '../../../context/create-index-page'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexContent = () => {
  const {
    activeTab,
    fields,
    command,
    isReadonly,
    fieldModal,
    openEditFieldModal,
    closeFieldModal,
    handleFieldSubmit,
  } = useCreateIndexPage()

  return (
    <S.ContentArea data-testid="vector-search--create-index--content">
      {activeTab === CreateIndexTab.Table && (
        <IndexDetails
          fields={fields}
          mode={
            isReadonly ? IndexDetailsMode.Readonly : IndexDetailsMode.Editable
          }
          onFieldEdit={openEditFieldModal}
        />
      )}

      {activeTab === CreateIndexTab.Command && (
        <CommandView
          command={command}
          dataTestId="vector-search--create-index--command-view"
        />
      )}

      <FieldTypeModal
        isOpen={fieldModal.isOpen}
        mode={fieldModal.mode}
        field={fieldModal.field}
        fields={fields}
        onSubmit={handleFieldSubmit}
        onClose={closeFieldModal}
      />
    </S.ContentArea>
  )
}
