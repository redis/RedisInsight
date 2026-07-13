import React, { useContext } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Text } from 'uiSrc/components/base/text'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'

import { IndexDetails } from '../../../components/index-details'
import { IndexDetailsMode } from '../../../components/index-details/IndexDetails.types'
import { CommandView } from '../../../components/command-view'
import { FieldTypeModal } from '../../../components/field-type-modal'
import SelectDataImg from 'uiSrc/assets/img/vector-search/vector-search-browser.svg?react'
import SelectDataImgDark from 'uiSrc/assets/img/vector-search/vector-search-browser-dark.svg?react'

import {
  CreateIndexTab,
  CreateIndexMode,
} from '../VectorSearchCreateIndexPage.types'
import { useCreateIndexPage } from '../../../context/create-index-page'
import { CreateIndexToolbar } from './CreateIndexToolbar'
import { CreateIndexFooter } from './CreateIndexFooter'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexContent = () => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const {
    mode,
    activeTab,
    fields,
    command,
    isReadonly,
    isManualCreation,
    rowSelection,
    onRowSelectionChange,
    fieldModal,
    openEditFieldModal,
    closeFieldModal,
    handleFieldSubmit,
  } = useCreateIndexPage()

  const isExistingData = mode === CreateIndexMode.ExistingData
  const EmptyStateImg = theme === Theme.Dark ? SelectDataImgDark : SelectDataImg

  if (isExistingData && fields.length === 0) {
    const showCommandView =
      isManualCreation && activeTab === CreateIndexTab.Command

    return (
      <S.CardContainer data-testid="vector-search--create-index--card">
        {isManualCreation && <CreateIndexToolbar />}

        <S.ContentArea data-testid="vector-search--create-index--content">
          {showCommandView ? (
            <CommandView
              command={command}
              dataTestId="vector-search--create-index--command-view"
            />
          ) : (
            <S.EmptyState
              align="center"
              justify="center"
              data-testid="vector-search--create-index--empty-state"
            >
              <EmptyStateImg />
              <Text size="M" color="secondary">
                {isManualCreation
                  ? t('vectorSearch.createIndex.content.emptyStateManual')
                  : t('vectorSearch.createIndex.content.emptyState')}
              </Text>
            </S.EmptyState>
          )}

          {isManualCreation && (
            <FieldTypeModal
              isOpen={fieldModal.isOpen}
              mode={fieldModal.mode}
              field={fieldModal.field}
              fields={fields}
              onSubmit={handleFieldSubmit}
              onClose={closeFieldModal}
            />
          )}
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
