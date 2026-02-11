import React from 'react'

import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { EditorTab, EditorLibraryToggleProps } from './QueryEditor.types'
import * as S from './QueryEditor.styles'

const tabs = [
  { value: EditorTab.Editor, label: 'Editor' },
  { value: EditorTab.Library, label: 'Library' },
]

export const EditorLibraryToggle = ({
  activeTab,
  onChangeTab,
}: EditorLibraryToggleProps) => (
  <S.ToggleBar data-testid="editor-library-toggle">
    <ButtonGroup data-testid="editor-library-tabs">
      {tabs.map((tab) => (
        <ButtonGroup.Button
          key={tab.value}
          isSelected={activeTab === tab.value}
          onClick={() => onChangeTab(tab.value)}
          data-testid={`editor-library-tab-${tab.value}`}
        >
          {tab.label}
        </ButtonGroup.Button>
      ))}
    </ButtonGroup>
  </S.ToggleBar>
)
