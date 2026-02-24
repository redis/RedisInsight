import React from 'react'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'

import { CreateIndexTab } from '../VectorSearchCreateIndexPage.types'
import { useCreateIndexPage } from '../../../context/create-index-page'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexToolbar = () => {
  const {
    activeTab,
    setActiveTab,
    indexPrefix,
    isReadonly,
    openAddFieldModal,
  } = useCreateIndexPage()

  return (
    <S.ToolbarRow
      align="center"
      justify="between"
      data-testid="vector-search--create-index--toolbar"
    >
      <ButtonGroup data-testid="vector-search--create-index--view-toggle">
        <ButtonGroup.Button
          isSelected={activeTab === CreateIndexTab.Table}
          onClick={() => setActiveTab(CreateIndexTab.Table)}
          data-testid="vector-search--create-index--table-view-btn"
        >
          Table view
        </ButtonGroup.Button>
        <ButtonGroup.Button
          isSelected={activeTab === CreateIndexTab.Command}
          onClick={() => setActiveTab(CreateIndexTab.Command)}
          data-testid="vector-search--create-index--command-view-btn"
        >
          Command view
        </ButtonGroup.Button>
      </ButtonGroup>

      <S.ToolbarRight
        align="center"
        data-testid="vector-search--create-index--toolbar-right"
      >
        <EmptyButton
          disabled={isReadonly}
          onClick={openAddFieldModal}
          data-testid="vector-search--create-index--add-field-btn"
        >
          + Add field
        </EmptyButton>

        <S.VerticalSeparator />

        <S.IndexPrefixRow align="center">
          <Text size="S" color="secondary">
            Index prefix:
          </Text>
          <Text
            size="S"
            color="default"
            data-testid="vector-search--create-index--prefix-value"
          >
            {indexPrefix}
          </Text>
        </S.IndexPrefixRow>
      </S.ToolbarRight>
    </S.ToolbarRow>
  )
}
