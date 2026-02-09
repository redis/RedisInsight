import React from 'react'

import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import { EditorTab } from './QueryEditor.types'
import * as S from './QueryEditor.styles'

export interface EditorLibraryToggleProps {
  activeTab: EditorTab
  onChangeTab: (tab: EditorTab) => void
}

export const EditorLibraryToggle = ({
  activeTab,
  onChangeTab,
}: EditorLibraryToggleProps) => (
  <S.ToggleBar
    data-testid="editor-library-toggle"
  >
    <ToggleButton
      isSelected={activeTab === EditorTab.Editor}
      onClick={() => onChangeTab(EditorTab.Editor)}
      data-testid="toggle-editor"
    >
      Editor
    </ToggleButton>
    <ToggleButton
      isSelected={activeTab === EditorTab.Library}
      onClick={() => onChangeTab(EditorTab.Library)}
      data-testid="toggle-library"
    >
      Library
    </ToggleButton>
  </S.ToggleBar>
)
