import React, { useEffect, useRef } from 'react'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'

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
  const {
    mode,
    activeTab,
    setActiveTab,
    indexPrefix,
    setIndexPrefix,
    isReadonly,
    openAddFieldModal,
  } = useCreateIndexPage()

  const { currentStep, isActive } = useCreateIndexOnboarding()
  const tabBeforeOnboardingRef = useRef<CreateIndexTab | null>(null)

  useEffect(() => {
    if (!isActive) return

    if (currentStep === CreateIndexOnboardingStep.CommandView) {
      tabBeforeOnboardingRef.current = activeTab
      setActiveTab(CreateIndexTab.Command)
    } else if (tabBeforeOnboardingRef.current !== null) {
      setActiveTab(tabBeforeOnboardingRef.current)
      tabBeforeOnboardingRef.current = null
    }
  }, [currentStep, isActive])

  const isExistingData = mode === CreateIndexMode.ExistingData

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
      </CreateIndexOnboardingPopover>

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

        <CreateIndexOnboardingPopover
          step={CreateIndexOnboardingStep.IndexPrefix}
          anchorPosition="downCenter"
        >
          <S.IndexPrefixRow align="center">
            <Text size="S" color="secondary">
              Index prefix:
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
