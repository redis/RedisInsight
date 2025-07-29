import React, { useState } from 'react'
import { ButtonGroup, ButtonGroupProps } from '@redis-ui/components'
import { BuildNewIndexTabTrigger } from './build-new-index-tab/BuildNewIndexTabTrigger'
import { StyledCreateIndexStepWrapper } from './CreateIndexStepWrapper.styles'

export enum VectorIndexTab {
  BuildNewIndex = 'build-new-index',
  UsePresetIndex = 'use-preset-index',
}

interface IndexStepTab {
  value: VectorIndexTab
  label: React.ReactNode
  disabled?: boolean
}

const VECTOR_INDEX_TABS: IndexStepTab[] = [
  {
    value: VectorIndexTab.BuildNewIndex,
    label: <BuildNewIndexTabTrigger />,
    disabled: true,
  },
  {
    value: VectorIndexTab.UsePresetIndex,
    label: 'Use preset index',
  },
]

export interface CreateIndexStepWrapperProps extends ButtonGroupProps {
  tabs?: IndexStepTab[]
  defaultValue?: VectorIndexTab
}

export const CreateIndexStepWrapper = (
  props: Partial<CreateIndexStepWrapperProps>,
) => {
  const { tabs = VECTOR_INDEX_TABS, defaultValue, ...rest } = props

  const [selectedTab, setSelectedTab] = useState<VectorIndexTab | null>(
    defaultValue ?? tabs.filter((tab) => !tab.disabled)[0]?.value ?? null,
  )

  const isTabSelected = (value: VectorIndexTab) => selectedTab === value

  return (
    <StyledCreateIndexStepWrapper>
      <ButtonGroup {...rest}>
        {tabs.map((tab) => (
          <ButtonGroup.Button
            disabled={tab.disabled}
            isSelected={isTabSelected(tab.value)}
            onClick={() => setSelectedTab(tab.value)}
            key={`vector-index-tab-${tab.value}`}
          >
            {tab.label}
          </ButtonGroup.Button>
        ))}
      </ButtonGroup>

      {selectedTab === VectorIndexTab.BuildNewIndex && (
        <div data-testid="vector-index-tabs--build-new-index-content">
          TODO: Add content later
        </div>
      )}

      {selectedTab === VectorIndexTab.UsePresetIndex && (
        <div data-testid="vector-index-tabs--use-preset-index-content">
          TODO: Add content later
        </div>
      )}
    </StyledCreateIndexStepWrapper>
  )
}
