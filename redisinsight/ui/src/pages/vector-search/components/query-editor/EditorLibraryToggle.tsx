import React from 'react'

import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { Icon } from 'uiSrc/components/base/icons'
import { KnowledgeBaseIcon } from '@redis-ui/icons'
import { EditorTab, EditorLibraryToggleProps } from './QueryEditor.types'
import { QueryOnboardingPopover } from './components/query-onboarding-popover'
import * as S from './QueryEditor.styles'

const tabs = [
  { value: EditorTab.Editor, label: 'Query editor' },
  { value: EditorTab.Library, label: 'Query library', icon: KnowledgeBaseIcon },
]

export const EditorLibraryToggle = ({
  activeTab,
  onChangeTab,
}: EditorLibraryToggleProps) => (
  <S.ToggleBar data-testid="editor-library-toggle">
    <QueryOnboardingPopover>
      <ButtonGroup data-testid="editor-library-tabs">
        {tabs.map((tab) => (
          <ButtonGroup.Button
            key={tab.value}
            isSelected={activeTab === tab.value}
            onClick={() => onChangeTab(tab.value)}
            data-testid={`editor-library-tab-${tab.value}`}
          >
            {tab.icon && <Icon icon={tab.icon} size="M" color="currentColor" />}{' '}
            {tab.label}
          </ButtonGroup.Button>
        ))}
      </ButtonGroup>
    </QueryOnboardingPopover>
  </S.ToggleBar>
)
