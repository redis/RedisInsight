import React from 'react'

import { Text } from 'uiSrc/components/base/text'

import { IndexDetails } from '../../../components/index-details'
import { IndexDetailsMode } from '../../../components/index-details/IndexDetails.types'
import { CommandView } from '../../../components/command-view'
import { FieldTypeModal } from '../../../components/field-type-modal'
import SampleDataModalImg from 'uiSrc/assets/img/vector-search/sample-data-modal-img.svg?react'

import {
  CreateIndexTab,
  CreateIndexMode,
} from '../VectorSearchCreateIndexPage.types'
import { useCreateIndexPage } from '../../../context/create-index-page'
import { CreateIndexToolbar } from './CreateIndexToolbar'
import { CreateIndexFooter } from './CreateIndexFooter'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexContent = () => {
  const {
    mode,
    activeTab,
    fields,
    command,
    isReadonly,
    rowSelection,
    onRowSelectionChange,
    fieldModal,
    openEditFieldModal,
    closeFieldModal,
    handleFieldSubmit,
  } = useCreateIndexPage()

  const isExistingData = mode === CreateIndexMode.ExistingData

  if (isExistingData && fields.length === 0) {
    return (
      <S.CardContainer data-testid="vector-search--create-index--card">
        <S.ContentArea data-testid="vector-search--create-index--content">
          <S.EmptyState
            align="center"
            justify="center"
            data-testid="vector-search--create-index--empty-state"
          >
            <SampleDataModalImg />
            <Text size="M" color="secondary">
              The indexing schema will appear here once you{'\n'}
              select a key from the browser on the left.
            </Text>
          </S.EmptyState>
        </S.ContentArea>
        <CreateIndexFooter />
      </S.CardContainer>
    )
  }

  return (
    <S.CardContainer data-testid="vector-search--create-index--card">
      <CreateIndexToolbar />

      <S.ContentArea data-testid="vector-search--create-index--content">
        {activeTab === CreateIndexTab.Table && (
          <IndexDetails
            fields={fields}
            mode={
              isReadonly ? IndexDetailsMode.Readonly : IndexDetailsMode.Editable
            }
            rowSelection={isExistingData ? rowSelection : undefined}
            onRowSelectionChange={
              isExistingData ? onRowSelectionChange : undefined
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

      <CreateIndexFooter />
    </S.CardContainer>
  )
}
