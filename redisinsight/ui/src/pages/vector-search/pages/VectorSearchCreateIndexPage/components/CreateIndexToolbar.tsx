import React, { useEffect, useRef } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  CreateIndexTab,
  CreateIndexMode,
} from '../VectorSearchCreateIndexPage.types'
import { useCreateIndexPage } from '../../../context/create-index-page'
import { useCreateIndexOnboarding } from '../../../context/create-index-onboarding'
import { CreateIndexOnboardingPopover } from '../../../components/create-index-onboarding'
import { CreateIndexOnboardingStep } from '../../../components/create-index-onboarding/CreateIndexOnboarding.constants'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexToolbar = () => {
  const { t } = useTranslation()
  const {
    mode,
    activeTab,
    setActiveTab,
    indexPrefix,
    setIndexPrefix,
    isReadonly,
    isManualCreation,
    keyType,
    setKeyType,
    fields,
    openAddFieldModal,
  } = useCreateIndexPage()

  const { currentStep, isActive } = useCreateIndexOnboarding()
  const tabBeforeOnboardingRef = useRef<CreateIndexTab | null>(null)

  useEffect(() => {
    if (isActive && currentStep === CreateIndexOnboardingStep.CommandView) {
      tabBeforeOnboardingRef.current = activeTab
      setActiveTab(CreateIndexTab.Command)
    } else if (tabBeforeOnboardingRef.current !== null) {
      setActiveTab(tabBeforeOnboardingRef.current)
      tabBeforeOnboardingRef.current = null
    }
  }, [currentStep, isActive])

  const isExistingData = mode === CreateIndexMode.ExistingData
  // There is nothing to preview until the first field is added manually
  const isViewToggleDisabled = isManualCreation && fields.length === 0

  return (
    <S.ToolbarRow
      align="center"
      justify="between"
      data-testid="vector-search--create-index--toolbar"
    >
      <CreateIndexOnboardingPopover
        step={CreateIndexOnboardingStep.CommandView}
        anchorPosition="rightCenter"
      >
        <ButtonGroup data-testid="vector-search--create-index--view-toggle">
          <ButtonGroup.Button
            isSelected={activeTab === CreateIndexTab.Table}
            disabled={isViewToggleDisabled}
            onClick={() => setActiveTab(CreateIndexTab.Table)}
            data-testid="vector-search--create-index--table-view-btn"
          >
            {t('vectorSearch.createIndex.toolbar.tableView')}
          </ButtonGroup.Button>
          <ButtonGroup.Button
            isSelected={activeTab === CreateIndexTab.Command}
            disabled={isViewToggleDisabled}
            onClick={() => setActiveTab(CreateIndexTab.Command)}
            data-testid="vector-search--create-index--command-view-btn"
          >
            {t('vectorSearch.createIndex.toolbar.commandView')}
          </ButtonGroup.Button>
        </ButtonGroup>
      </CreateIndexOnboardingPopover>

      <S.ToolbarRight
        align="center"
        data-testid="vector-search--create-index--toolbar-right"
      >
        {isManualCreation && (
          <>
            <S.IndexPrefixRow align="center">
              <Text size="S" color="secondary">
                {t('vectorSearch.createIndex.toolbar.keyType')}
              </Text>
              <ButtonGroup data-testid="vector-search--create-index--key-type-toggle">
                <ButtonGroup.Button
                  isSelected={keyType === RedisearchIndexKeyType.HASH}
                  onClick={() => setKeyType(RedisearchIndexKeyType.HASH)}
                  data-testid="vector-search--create-index--key-type-hash-btn"
                >
                  HASH
                </ButtonGroup.Button>
                <ButtonGroup.Button
                  isSelected={keyType === RedisearchIndexKeyType.JSON}
                  onClick={() => setKeyType(RedisearchIndexKeyType.JSON)}
                  data-testid="vector-search--create-index--key-type-json-btn"
                >
                  JSON
                </ButtonGroup.Button>
              </ButtonGroup>
            </S.IndexPrefixRow>

            <S.VerticalSeparator />
          </>
        )}

        <EmptyButton
          disabled={isReadonly}
          onClick={openAddFieldModal}
          data-testid="vector-search--create-index--add-field-btn"
        >
          {t('vectorSearch.createIndex.toolbar.addField')}
        </EmptyButton>

        <S.VerticalSeparator />

        <CreateIndexOnboardingPopover
          step={CreateIndexOnboardingStep.IndexPrefix}
          anchorPosition="downCenter"
        >
          <S.IndexPrefixRow align="center">
            <Text size="S" color="secondary">
              {t('vectorSearch.createIndex.toolbar.indexPrefix')}
            </Text>
            {isExistingData ? (
              <S.IndexPrefixInput
                value={indexPrefix}
                onChange={(value: string) => setIndexPrefix(value)}
                data-testid="vector-search--create-index--prefix-input"
              />
            ) : (
              <Text
                size="S"
                color="default"
                data-testid="vector-search--create-index--prefix-value"
              >
                {indexPrefix}
              </Text>
            )}
          </S.IndexPrefixRow>
        </CreateIndexOnboardingPopover>
      </S.ToolbarRight>
    </S.ToolbarRow>
  )
}
