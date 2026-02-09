import React from 'react'

import Tabs from 'uiSrc/components/base/layout/tabs'
import { EditorTab, EditorLibraryToggleProps } from './QueryEditor.types'
import * as S from './QueryEditor.styles'

const tabs = [
  { value: EditorTab.Editor, label: 'Editor', content: null },
  { value: EditorTab.Library, label: 'Library', content: null },
]

export const EditorLibraryToggle = ({
  activeTab,
  onChangeTab,
}: EditorLibraryToggleProps) => (
  <S.ToggleBar data-testid="editor-library-toggle">
    <Tabs
      tabs={tabs}
      variant="sub"
      value={activeTab}
      onChange={(id) => onChangeTab(id as EditorTab)}
      data-testid="editor-library-tabs"
    />
  </S.ToggleBar>
)
