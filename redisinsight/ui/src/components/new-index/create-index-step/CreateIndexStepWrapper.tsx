import React, { useState } from 'react'
import { ButtonGroup, ButtonGroupProps } from '@redis-ui/components'
import { StyledCreateIndexStepWrapper } from './CreateIndexStepWrapper.styles'

export enum VectorIndexTab {
  BuildNewIndex = 'build-new-index',
  UsePresetIndex = 'use-preset-index',
}

export interface IndexStepTab {
  value: VectorIndexTab
  label: React.ReactNode
  disabled?: boolean
  content?: React.ReactNode
}
export interface CreateIndexStepWrapperProps extends ButtonGroupProps {
  tabs: IndexStepTab[]
}

export const CreateIndexStepWrapper = (props: CreateIndexStepWrapperProps) => {
  const { tabs, ...rest } = props

  const [selectedTab, setSelectedTab] = useState<IndexStepTab | null>(
    tabs.filter((tab) => !tab.disabled)[0] ?? null,
  )

  const isTabSelected = (value: VectorIndexTab) => selectedTab?.value === value

  return (
    <StyledCreateIndexStepWrapper>
      <ButtonGroup {...rest}>
        {tabs.map((tab) => (
          <ButtonGroup.Button
            disabled={tab.disabled}
            isSelected={isTabSelected(tab.value)}
            onClick={() => setSelectedTab(tab)}
            key={`vector-index-tab-${tab.value}`}
          >
            {tab.label}
          </ButtonGroup.Button>
        ))}
      </ButtonGroup>
      {selectedTab?.content}
    </StyledCreateIndexStepWrapper>
  )
}
