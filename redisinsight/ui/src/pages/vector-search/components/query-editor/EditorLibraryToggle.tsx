import React from 'react'

import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import { EditorTab, EditorLibraryToggleProps } from './QueryEditor.types'
import * as S from './QueryEditor.styles'

export const EditorLibraryToggle = ({
  activeTab,
  onChangeTab,
}: EditorLibraryToggleProps) => (
  <S.ToggleBar data-testid="editor-library-toggle">
    <ToggleButton
      pressed={activeTab === EditorTab.Editor}
      onPressedChange={() => onChangeTab(EditorTab.Editor)}
      data-testid="toggle-editor"
    >
      Editor
    </ToggleButton>
    <ToggleButton
      pressed={activeTab === EditorTab.Library}
      onPressedChange={() => onChangeTab(EditorTab.Library)}
      data-testid="toggle-library"
    >
      Library
    </ToggleButton>
  </S.ToggleBar>
)
